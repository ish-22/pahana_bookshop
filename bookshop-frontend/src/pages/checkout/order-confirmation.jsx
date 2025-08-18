import React, { useEffect, useState } from "react";
import { Check, Download, Mail, Package, Truck, Home } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { downloadInvoice } from "../../utils/invoiceGenerator";

export default function OrderConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        // Get order data from navigation state
        if (location.state) {
            setOrderData(location.state);
            console.log("Order data:", location.state);
        } else {
            navigate("/books");
        }
    }, [location.state, navigate]);

    if (!orderData) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const handleDownloadInvoice = async () => {
        setIsDownloading(true);

        try {
            // Add a small delay to show loading state
            await new Promise((resolve) => setTimeout(resolve, 500));

            console.log("Order data for invoice:", orderData);

            const invoiceData = {
                orderNumber: orderData.orderNumber || orderData.id || "N/A",
                orderId: orderData.orderId || orderData.id || "N/A",
                total: orderData.total || 0,
                ...orderData,
            };

            const success = downloadInvoice(
                invoiceData,
                orderData.customerInfo || null,
                orderData.orderItems || []
            );

            if (success) {
                // Show success message (optional)
                console.log("Invoice downloaded successfully");
            } else {
                // Show error message
                alert("Failed to generate invoice. Please try again.");
            }
        } catch (error) {
            console.error("Error downloading invoice:", error);
            alert("Failed to generate invoice. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50">
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link
                        to="/books"
                        className="px-4 py-2 bg-amber-600 rounded-2xl inline-flex items-center gap-2 text-white hover:text-amber-800 transition-colors mb-4"
                    >
                        <Home className="h-4 w-4" />
                        Continue Shopping
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Order Confirmation
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="h-10 w-10 text-green-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Thank you for your order!
                    </h2>

                    <p className="text-gray-600 mb-6">
                        Your order has been successfully placed and is being
                        processed.
                    </p>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center gap-2 text-amber-800">
                            <Package className="h-5 w-5" />
                            <span className="font-semibold">
                                Order #{orderData.orderNumber}
                            </span>
                        </div>
                        <p className="text-amber-700 text-sm mt-1">
                            Please save this order number for your records
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-left">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Order Total
                            </h3>
                            <p className="text-2xl font-bold text-amber-600">
                                ${orderData.total.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Estimated Delivery
                            </h3>
                            <p className="text-lg font-semibold text-gray-700">
                                {new Date(
                                    Date.now() + 7 * 24 * 60 * 60 * 1000
                                ).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Status Timeline */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        Order Status
                    </h3>

                    <div className="relative">
                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>

                        <div className="relative space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center relative z-10">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        Order Placed
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {new Date().toLocaleDateString(
                                            "en-US",
                                            {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center relative z-10">
                                    <Package className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        Processing
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Your order is being prepared
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center relative z-10">
                                    <Truck className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-500">
                                        Shipped
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        Will be updated when your order ships
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center relative z-10">
                                    <Home className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-500">
                                        Delivered
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        Estimated delivery date shown above
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items Details */}
                {orderData.orderItems && orderData.orderItems.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            Order Items
                        </h3>

                        <div className="space-y-4">
                            {orderData.orderItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                                >
                                    <img
                                        src={
                                            item.image ||
                                            "/placeholder-book.jpg"
                                        }
                                        alt={item.title}
                                        className="w-16 h-20 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">
                                            {item.title}
                                        </h4>
                                        <p className="text-gray-600 text-sm">
                                            by {item.author}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm text-gray-600">
                                                Quantity: {item.quantity}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    ${item.price.toFixed(2)}{" "}
                                                    each
                                                </p>
                                                <p className="font-semibold text-amber-600">
                                                    $
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="max-w-sm ml-auto">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Subtotal:
                                        </span>
                                        <span className="font-medium">
                                            $
                                            {orderData.subtotal
                                                ? orderData.subtotal.toFixed(2)
                                                : "0.00"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Tax:
                                        </span>
                                        <span className="font-medium">
                                            $
                                            {orderData.tax
                                                ? orderData.tax.toFixed(2)
                                                : "0.00"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Shipping:
                                        </span>
                                        <span className="font-medium">
                                            {orderData.shipping === 0
                                                ? "FREE"
                                                : `$${
                                                      orderData.shipping
                                                          ? orderData.shipping.toFixed(
                                                                2
                                                            )
                                                          : "0.00"
                                                  }`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                                        <span>Total:</span>
                                        <span className="text-amber-600">
                                            ${orderData.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Customer Information */}
                {orderData.customerInfo && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            Shipping Information
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                    Ship To:
                                </h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>
                                        {orderData.customerInfo.firstName}{" "}
                                        {orderData.customerInfo.lastName}
                                    </p>
                                    <p>{orderData.customerInfo.address}</p>
                                    <p>
                                        {orderData.customerInfo.city},{" "}
                                        {orderData.customerInfo.state}{" "}
                                        {orderData.customerInfo.zipCode}
                                    </p>
                                    <p>{orderData.customerInfo.country}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                    Contact:
                                </h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>{orderData.customerInfo.email}</p>
                                    <p>{orderData.customerInfo.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        What happens next?
                    </h3>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <Mail className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    Confirmation Email
                                </h4>
                                <p className="text-sm text-gray-600">
                                    You'll receive an order confirmation email
                                    with your receipt and tracking information.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Package className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    Order Processing
                                </h4>
                                <p className="text-sm text-gray-600">
                                    We'll prepare your books for shipment. This
                                    usually takes 1-2 business days.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Truck className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    Shipping Updates
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Once shipped, you'll receive tracking
                                    information to monitor your delivery.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleDownloadInvoice}
                        disabled={isDownloading}
                        className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Download Invoice
                            </>
                        )}
                    </button>

                    <Link
                        to="/books"
                        className="flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                    >
                        <Package className="h-4 w-4" />
                        Continue Shopping
                    </Link>
                </div>

                {/* Support Information */}
                <div className="bg-gray-50 rounded-xl p-6 mt-8 text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">
                        Need Help?
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                        If you have any questions about your order, please don't
                        hesitate to contact us.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                        <span className="text-gray-600">
                            Email: support@bookshop.com
                        </span>
                        <span className="hidden sm:inline text-gray-400">
                            |
                        </span>
                        <span className="text-gray-600">
                            Phone: (555) 123-4567
                        </span>
                        <span className="hidden sm:inline text-gray-400">
                            |
                        </span>
                        <span className="text-gray-600">
                            Hours: Mon-Fri 9AM-6PM EST
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
