import { useUser } from "@auth0/nextjs-auth0";
import React, { useEffect, useState } from "react";
import SpinnerWithMessage from "../Common/SpinnerWithMessage";
import { OrderProduct, OrderSeller, Order } from "../../types/orders";
import { makeGraphQLQuery } from "../../lib/GraphQL";
import { convertCentToDollar } from "../../lib/helpers";
import Link from "next/link";

const UserOrders = () => {
  const { user } = useUser();
  const [orderData, setOrderData] = useState<Order[]>(null);

  useEffect(() => {
    if (!user) return;
    makeGraphQLQuery("getUserOrders", { user_id: user.sub })
      .then((res) => {
        const data: Order[] = res.order
          .map((item) => {
            return {
              order_id: item.order_id,
              shipping_address: item.shipping_address,
              stripe_checkout_id: item.stripe_checkout_id,
              order_status: item.order_status.order_status_name,
              created_at: new Date(item.created_at + "Z"),
              products: item.orders_products
                .map((product) => {
                  return {
                    product_name: product.variation_pair.product.product_name,
                    product_id: product.variation_pair.product_id,
                    variation_pair_id: product.variation_pair_id,
                    variation_1: product.variation_pair.variation_1,
                    variation_2: product.variation_pair.variation_2,
                    product_amount: product.product_amount,
                    total_price: product.total_price,
                    order_product_status: product.orders_products_status.orders_products_status_name,
                  }
                }),
              sellers: item.orders_sellers
                .map((seller) => {
                  return {
                    user_id: seller.user_id,
                    company_name: seller.seller.company_name,
                    stripe_id: seller.seller.stripe_id,
                    delivery_fee: seller.delivery_fee,
                    stripe_transfer_id: seller.stripe_transfer_id,
                    order_seller_status: seller.orders_sellers_status.orders_sellers_status_name,
                  }
                }),
            }
          })
        console.log(data);
        setOrderData(data);
      })
      .catch((err) => {
        console.log(err);
        return;
      });
  }, [user])

  if (!orderData) {
    return (
      <SpinnerWithMessage label="Getting Order Information" />
    );
  }

  return (
    <div className="col-span-4">
      <div className="grid space-y-4 grid-cols-1">
        {
          orderData.map((order: Order, index: number) => {
            const orderTotal =
              order.products.reduce((acc: number, product: OrderProduct) => {
                return acc + product.total_price
              }, 0) +
              order.sellers.reduce((acc: number, seller: OrderSeller) => {
                return acc + seller.delivery_fee
              }, 0)

            return (
              <div key={index} className="border-2">
                <p>
                  <b>Order ID: </b>{order.order_id}
                </p>

                <p>
                  <b>Order Placed: </b>{order.created_at.toString()}
                </p>

                <p>
                  <b>Shipping To: </b>{order.shipping_address}
                </p>

                <p>
                  <b>Order Status: </b>{order.order_status}
                </p>

                <p>
                  <b>Products: </b>
                </p>
                {
                  order.products.map((product: OrderProduct, index: number) => {
                    const itemDisplay = `${product.product_name} ${product.variation_1}${product.variation_2 ? `/${product.variation_2}` : ""} x${product.product_amount} - Total: $${convertCentToDollar(product.total_price)} - Status: ${product.order_product_status}`;

                    return (
                      <div key={index} className="px-4 py-2">
                        <div>
                          <Link href={`/product?product_id=${product.product_id}`} passHref>
                            <p className="text-md cursor-pointer hover:text-blue-400">
                              {itemDisplay}
                            </p>
                          </Link>
                        </div>
                      </div>
                    )
                  })
                }

                <p>
                  <b>Merchants: </b>
                </p>
                {
                  order.sellers.map((seller: OrderSeller, index: number) => {
                    return (
                      <div key={index} className="px-4 py-2">
                        <div>
                          <p>
                            {seller.company_name} - Shipping Total: ${convertCentToDollar(seller.delivery_fee)} - Status: {seller.order_seller_status}
                          </p>
                        </div>
                      </div>
                    )
                  })
                }

                <p>
                  <b>Order Total: ${convertCentToDollar(orderTotal)}</b>
                </p>
              </div>
            )
          })
        }
      </div>
    </div>
  );
};

export default UserOrders;
