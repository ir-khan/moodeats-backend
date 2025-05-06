export const RESTAURANT_STATUS = {
    ACTIVE: "ACTIVE",
    PENDING: "PENDING",
    INACTIVE: "INACTIVE",
    TEMPORARILY_CLOSED: "TEMPORARILY_CLOSED",
    UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
    SUSPENDED: "SUSPENDED",
};

export const ORDER_STATUS = {
    PENDING: "PENDING", // Order placed, awaiting confirmation
    CONFIRMED: "CONFIRMED", // Order confirmed by restaurant
    PREPARING: "PREPARING", // Restaurant is preparing the order
    READY: "READY", // Order is ready for pickup/delivery
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY", // Order is on its way to the customer
    DELIVERED: "DELIVERED", // Order delivered to the customer
    CANCELLED: "CANCELLED", // Order cancelled
    FAILED: "FAILED", // Order failed (e.g., payment or system error)
};

export const PAYMENT_STATUS = {
    PENDING: "PENDING",
    PAID: "PAID",
    FAILED: "FAILED",
    REFUNDED: "REFUNDED",
};

export const PAYMENT_METHOD = {
    COD: "COD",
    CARD: "CARD",
    UPI: "UPI",
    WALLET: "WALLET",
};
