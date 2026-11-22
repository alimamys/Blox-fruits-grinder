using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
#if !UNITY_WEBGL || UNITY_EDITOR
using UnityEngine.Purchasing;
#endif
#if OOPSIE_RECEIPT_VALIDATION && !UNITY_EDITOR
using UnityEngine.Purchasing.Security;
#endif

namespace OopsiePets
{
    /// <summary>
    /// The one in-app purchase: the full version (a non-consumable, <see cref="Entitlements.FullVersionProductId"/>),
    /// sold through Google Play / the App Store with Unity IAP 5. Only the parent settings (behind the parent
    /// gate) talk to it; children never see a price or a buy button.
    ///
    /// Flow: connect → fetch the product (for its local price) → fetch purchases (a reinstall gets the full
    /// version back) → buy → <c>OnPurchasePending</c> → (optional Google receipt check) → unlock and save →
    /// only then confirm the order. An order that could not be saved stays unconfirmed and comes back on the
    /// next launch. "Ask a parent" purchases (Google Family Link, Apple Ask to Buy) wait as deferred orders.
    ///
    /// The web demo has no store (Unity IAP would fall back to a fake store there), so this stays
    /// <see cref="StoreState.NotSupported"/> and the settings offer the test switch instead. In the Editor
    /// Unity IAP's Fake Store answers, so the whole flow can be tried without a real store.
    /// </summary>
    public class FullVersionStore : MonoBehaviour
    {
        public enum StoreState { NotSupported, Connecting, Ready, Unavailable, Purchasing, WaitingForApproval, Owned }

        public static FullVersionStore Instance { get; private set; }

        public StoreState State { get; private set; } = StoreState.NotSupported;
        /// <summary>The store's local price for the full version (e.g. "$3.99"), once known.</summary>
        public string Price { get; private set; } = "";
        /// <summary>Short note about the last purchase or restore, for the grown-ups' settings.</summary>
        public string LastMessage { get; private set; } = "";

        /// <summary>Raised whenever the state, price or message changes (the settings panel listens).</summary>
        public event Action Changed;
        /// <summary>Raised when a purchase or restore just unlocked the full version.</summary>
        public event Action Unlocked;

        public bool Supported => State != StoreState.NotSupported;
        public bool CanBuy => State == StoreState.Ready;

#if !UNITY_WEBGL || UNITY_EDITOR
        StoreController store;
        Product product;
        bool connecting, restoring;
#endif
#if OOPSIE_RECEIPT_VALIDATION && !UNITY_EDITOR
        CrossPlatformValidator validator;
#endif

        void Awake()
        {
            if (Instance && Instance != this) { Destroy(this); return; }
            Instance = this;
#if !UNITY_WEBGL || UNITY_EDITOR
            Connect();
#endif
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }

        void Set(StoreState s, string message = null)
        {
            State = s;
            if (message != null) LastMessage = message;
            Changed?.Invoke();
        }

#if !UNITY_WEBGL || UNITY_EDITOR
        /// <summary>Connects to the store (again, after it was unavailable).</summary>
        public async void Connect()
        {
            if (connecting) return;
            connecting = true;
            if (Entitlements.FullVersion && SaveSystem.Data.fullVersionSource == Entitlements.SourceStore) Owned(false);
            else Set(StoreState.Connecting, "");
            try
            {
                if (store == null)
                {
                    store = UnityIAPServices.StoreController();
                    // Every event is subscribed before Connect(): a purchase left unfinished last time can
                    // arrive as soon as the store connects.
                    store.OnStoreConnected += OnStoreConnected;
                    store.OnStoreDisconnected += OnStoreDisconnected;
                    store.OnProductsFetched += OnProductsFetched;
                    store.OnProductsFetchFailed += OnProductsFetchFailed;
                    store.OnPurchasesFetched += OnPurchasesFetched;
                    store.OnPurchasesFetchFailed += OnPurchasesFetchFailed;
                    store.OnPurchasePending += OnPurchasePending;
                    store.OnPurchaseConfirmed += OnPurchaseConfirmed;
                    store.OnPurchaseFailed += OnPurchaseFailed;
                    store.OnPurchaseDeferred += OnPurchaseDeferred;
                }
#if OOPSIE_RECEIPT_VALIDATION && !UNITY_EDITOR
                if (Application.platform == RuntimePlatform.Android && validator == null)
                    validator = new CrossPlatformValidator(GooglePlayTangle.Data(), Application.identifier);
#endif
                await store.Connect();
                store.FetchProducts(new List<ProductDefinition>
                {
                    new ProductDefinition(Entitlements.FullVersionProductId, ProductType.NonConsumable),
                });
            }
            catch (Exception e)
            {
                Debug.LogWarning($"[OopsiePets] Store connection failed: {e.Message}");
                if (State != StoreState.Owned) Set(StoreState.Unavailable, "");
            }
            finally
            {
                connecting = false;
            }
        }

        /// <summary>Starts the purchase (the parent settings call this, behind the parent gate).</summary>
        public void Buy()
        {
            if (store == null || product == null || State != StoreState.Ready) return;
            Set(StoreState.Purchasing, "");
            store.PurchaseProduct(product);
        }

        /// <summary>Asks the store to deliver earlier purchases again (required by Apple; harmless on Google).</summary>
        public void Restore()
        {
            if (store == null) { Connect(); return; }
            LastMessage = "Checking for purchases…";
            Changed?.Invoke();
            restoring = true;
            store.RestoreTransactions((ok, error) =>
            {
                // On success the store fetches the purchases again; OnPurchasesFetched reports the result.
                if (ok) return;
                restoring = false;
                bool phone = Application.platform == RuntimePlatform.Android || Application.platform == RuntimePlatform.IPhonePlayer;
                LastMessage = phone ? "Couldn't reach the store. Try again later." : "Restore works in the app on a phone or tablet.";
                Changed?.Invoke();
            });
        }

        // ---------- Store events ----------

        void OnStoreConnected() { }

        void OnStoreDisconnected(StoreConnectionFailureDescription failure)
        {
            Debug.LogWarning($"[OopsiePets] Store disconnected: {failure.Message}");
            if (State != StoreState.Owned) Set(StoreState.Unavailable, "");
        }

        void OnProductsFetched(List<Product> products)
        {
            product = products.FirstOrDefault(p => p.definition.id == Entitlements.FullVersionProductId);
            if (product == null || !product.availableToPurchase)
            {
                if (State != StoreState.Owned) Set(StoreState.Unavailable, "");
            }
            else
            {
                Price = product.metadata.localizedPriceString ?? "";
                if (State != StoreState.Owned) Set(StoreState.Ready);
                else Changed?.Invoke();
            }
            // Purchases made before (another phone, a reinstall) come back here.
            store.FetchPurchases();
        }

        void OnProductsFetchFailed(ProductFetchFailed failure)
        {
            Debug.LogWarning($"[OopsiePets] Product fetch failed: {failure.FailureReason}");
            if (State != StoreState.Owned) Set(StoreState.Unavailable, "");
        }

        void OnPurchasesFetched(Orders orders)
        {
            // Confirmed orders: already finished earlier. Unfinished ones arrive through OnPurchasePending.
            var owned = orders.ConfirmedOrders.FirstOrDefault(o => HasFullVersion(o));
            if (owned != null && IsValid(owned) && Entitlements.GrantFromStore(owned.Info.TransactionID)) Owned(true);
            if (restoring)
            {
                restoring = false;
                bool bought = Entitlements.FullVersion && SaveSystem.Data.fullVersionSource == Entitlements.SourceStore;
                bool waiting = orders.PendingOrders.Any(o => HasFullVersion(o));
                LastMessage = bought || waiting ? "Restored: full version" : "No purchases to restore";
                Changed?.Invoke();
            }
            if (orders.DeferredOrders.Any(o => HasFullVersion(o)) && State != StoreState.Owned) Set(StoreState.WaitingForApproval, "Waiting for a grown-up to approve");
        }

        void OnPurchasesFetchFailed(PurchasesFetchFailureDescription failure)
        {
            // Not fatal: whatever is saved on the device stays as it is.
            Debug.LogWarning($"[OopsiePets] Purchase fetch failed: {failure.Message}");
            if (restoring)
            {
                restoring = false;
                LastMessage = "Couldn't reach the store. Try again later.";
                Changed?.Invoke();
            }
        }

        void OnPurchasePending(PendingOrder order)
        {
            if (!HasFullVersion(order)) return;
            if (!IsValid(order))
            {
                // A receipt that fails validation is not unlocked (and not confirmed).
                if (State != StoreState.Owned) Set(StoreState.Ready, "The purchase couldn't be verified.");
                return;
            }
            // Unlock and save first; confirm only once the unlock is safely on the device. Granting twice is
            // harmless (it only sets the full version flag again).
            if (Entitlements.GrantFromStore(order.Info.TransactionID))
            {
                store.ConfirmPurchase(order);
                Owned(true);
            }
            else Debug.LogWarning("[OopsiePets] Purchase not saved; it will be delivered again on the next launch.");
        }

        void OnPurchaseConfirmed(Order order)
        {
            switch (order)
            {
                case ConfirmedOrder _:
                    break;
                case FailedOrder failed:
                    // The full version is already saved; the store delivers the order again next launch and
                    // the confirmation is retried then.
                    Debug.LogWarning($"[OopsiePets] Purchase confirmation failed: {failed.FailureReason} {failed.Details}");
                    break;
            }
        }

        void OnPurchaseFailed(FailedOrder order)
        {
            if (State == StoreState.Owned) return;
            string msg = order.FailureReason switch
            {
                PurchaseFailureReason.UserCancelled => "",
                PurchaseFailureReason.PaymentDeclined => "The payment was declined.",
                PurchaseFailureReason.DuplicateTransaction => "Already bought: tap Restore purchases.",
                PurchaseFailureReason.ExistingPurchasePending => "A purchase is already waiting.",
                _ => "The purchase didn't go through.",
            };
            Set(product != null && product.availableToPurchase ? StoreState.Ready : StoreState.Unavailable, msg);
        }

        void OnPurchaseDeferred(DeferredOrder order)
        {
            // "Ask a parent" (Google Family Link / Apple Ask to Buy): nothing is unlocked until it is approved;
            // the approved purchase then arrives through OnPurchasePending.
            if (HasFullVersion(order) && State != StoreState.Owned) Set(StoreState.WaitingForApproval, "Waiting for a grown-up to approve");
        }

        // ---------- Helpers ----------

        static bool HasFullVersion(Order order) =>
            order?.CartOrdered?.Items()?.Any(i => i.Product != null && i.Product.definition.id == Entitlements.FullVersionProductId) == true;

        bool IsValid(Order order)
        {
#if OOPSIE_RECEIPT_VALIDATION && !UNITY_EDITOR
            if (validator != null)
            {
                try { validator.Validate(order.Info.Receipt); }
                catch (IAPSecurityException e)
                {
                    Debug.LogWarning($"[OopsiePets] Invalid receipt: {e.Message}");
                    return false;
                }
            }
#endif
            return true;
        }
#endif

#if UNITY_WEBGL && !UNITY_EDITOR
        // The web demo has no store.
        public void Connect() { }
        public void Buy() { }
        public void Restore() { }
#endif

        void Owned(bool justUnlocked)
        {
            bool wasOwned = State == StoreState.Owned;
            Set(StoreState.Owned, wasOwned ? null : (justUnlocked ? "Thank you! The full version is unlocked." : ""));
            if (justUnlocked && !wasOwned) Unlocked?.Invoke();
        }
    }
}
