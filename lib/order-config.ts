// lib/order-config.ts
//
// storeOrder (see lib/api.ts) posts to an internal Laravel endpoint that
// was built for a POS/admin order screen. It requires several IDs that
// only make sense in the context of your accounting setup and can't be
// guessed safely — sending the wrong branch_id/ledger_id/account_id will
// silently create incorrect orders. Fill these in with real values before
// going live.

export const ORDER_CONFIG = {
    /** Which branch online-store orders should be attributed to. */
    BRANCH_ID: 0, // TODO: replace with your web-store branch id

    /** The ledger that receives payment for a normal (non-advance) order. */
    LEDGER_ID: 0, // TODO: replace with your default sales/cash ledger id

    /** The ledger that receives an advance/partial payment, if applicable. */
    ADVANCE_LEDGER_ID: 0, // TODO: replace with your advance-payment ledger id

    /**
     * The "walk-in"/default account_id to use when the customer doesn't map
     * to an existing account record. If logged-in customers have their own
     * account_id, prefer that over this fallback.
     */
    DEFAULT_ACCOUNT_ID: 0, // TODO: replace with your default customer account id

    /** Sales team / channel identifier, if your schema tracks one. Leave '' if unused. */
    TEAM: '',

    /**
     * Maps the storefront's payment method values to whatever strings
     * ApiController::storeOrder expects in `payment_type`.
     * TODO: confirm the exact accepted values with your backend.
     */
    PAYMENT_TYPE_MAP: {
        cod: 'Cash',
        online: 'Online',
        bkash: 'bKash',
    } as Record<string, string>,
}