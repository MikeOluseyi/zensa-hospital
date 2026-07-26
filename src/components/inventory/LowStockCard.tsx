"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function LowStockCard() {

  const [items, setItems] =
    useState([]);

  useEffect(() => {

    async function load() {

      const res =
        await api.get(
          "/inventory/low-stock"
        );

      setItems(res.data);
    }

    load();

  }, []);

  return (

    <div className="bg-red-50 p-4 rounded-xl">

      <h3 className="font-bold mb-2">
        Low Stock Alerts
      </h3>

      {items.map((item: any) => (

        <div key={item.id}>

          {item.name}
          {" "}
          ({item.quantity})

        </div>

      ))}

    </div>
  );
}