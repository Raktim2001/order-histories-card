// import {
//   hubspot,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Text,
// } from "@hubspot/ui-extensions";
// import React from "react";

// hubspot.extend(({ context }) => <ViewOrderHistory data={context.data} />);

// const ViewOrderHistory = ({ data }) => {
//   let orders = [];

//   try {
//     orders = JSON.parse(
//       data?.body ||
//         JSON.stringify([
//           {
//             customerName: "Jane Doe",
//             hplId: "HPL123",
//             orderNum: "ORD456",
//             channel: "Online",
//             date: "2025-07-03",
//             fulfillment: "Shipped",
//             hubspotId: "HS789",
//             productName: "Widget Pro",
//             qty: 3,
//             salesPrice: "49.99",
//             sku: "SKU-ABC",
//             total: "149.97",
//           },
//         ])
//     );
//   } catch (e) {
//     console.error("Failed to parse order data", e);
//   }

//   return (
//     <>
//       <Text format={{ fontWeight: "bold" }}>Order Histories</Text>
//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell>Customer Name</TableCell>
//             <TableCell>HPL ID</TableCell>
//             <TableCell>Order Num</TableCell>
//             <TableCell>Channel</TableCell>
//             <TableCell>Date</TableCell>
//             <TableCell>Fulfillment</TableCell>
//             <TableCell>Hubspot ID</TableCell>
//             <TableCell>Product Name</TableCell>
//             <TableCell>Qty</TableCell>
//             <TableCell>Sales Price</TableCell>
//             <TableCell>SKU</TableCell>
//             <TableCell>Total</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {orders.map((o, idx) => (
//             <TableRow key={idx}>
//               <TableCell>{o.customerName}</TableCell>
//               <TableCell>{o.hplId}</TableCell>
//               <TableCell>{o.orderNum}</TableCell>
//               <TableCell>{o.channel}</TableCell>
//               <TableCell>{o.date}</TableCell>
//               <TableCell>{o.fulfillment}</TableCell>
//               <TableCell>{o.hubspotId}</TableCell>
//               <TableCell>{o.productName}</TableCell>
//               <TableCell>{o.qty}</TableCell>
//               <TableCell>{o.salesPrice}</TableCell>
//               <TableCell>{o.sku}</TableCell>
//               <TableCell>{o.total}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </>
//   );
// };

import React, { useEffect, useState } from "react";
import {
  hubspot,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Text,
  Button,
  Flex,
  LoadingSpinner,
} from "@hubspot/ui-extensions";

hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <ViewOrderHistory
    context={context}
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
  />
));

const ViewOrderHistory = ({ context, runServerless, sendAlert }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const result = await runServerless({
        name: "orderHistories",
        parameters: { contactId: context.objectId },
      });

      console.log("runServerless result:", result);

      if (result?.statusCode && result.statusCode !== 200) {
        throw new Error(
          `Serverless returned error ${result.statusCode}: ${result.body}`
        );
      }

      let ordersData;
      if (typeof result?.response === "string") {
        ordersData = JSON.parse(result.response);
      } else if (result?.response) {
        ordersData = result.response;
      } else {
        throw new Error("Empty serverless response");
      }

      console.log("Parsed ordersData:", ordersData);

      setOrders(ordersData);

      sendAlert({
        type: "success",
        message: "Fetched order histories!",
      });
    } catch (e) {
      console.error("Fetch failed:", e);
      sendAlert({
        type: "error",
        message: `Failed to fetch order histories: ${
          typeof e === "object" ? JSON.stringify(e, null, 2) : e
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <Text format={{ fontWeight: "bold" }}>Order Histories</Text>
      <Flex direction="row" gap="small" alignment="center">
        <Button onClick={fetchOrders} disabled={loading}>
          {loading ? <LoadingSpinner /> : "Reload Orders"}
        </Button>
      </Flex>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Customer Name</TableCell>
            <TableCell>HPL ID</TableCell>
            <TableCell>Order Num</TableCell>
            <TableCell>Channel</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Fulfillment</TableCell>
            <TableCell>Hubspot ID</TableCell>
            <TableCell>Product Name</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Sales Price</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((o, idx) => (
            <TableRow key={idx}>
              <TableCell>{o.customerName}</TableCell>
              <TableCell>{o.hplId}</TableCell>
              <TableCell>{o.orderNum}</TableCell>
              <TableCell>{o.channel}</TableCell>
              <TableCell>{o.date}</TableCell>
              <TableCell>{o.fulfillment}</TableCell>
              <TableCell>{o.hubspotId}</TableCell>
              <TableCell>{o.productName}</TableCell>
              <TableCell>{o.qty}</TableCell>
              <TableCell>{o.salesPrice}</TableCell>
              <TableCell>{o.sku}</TableCell>
              <TableCell>{o.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default ViewOrderHistory;
