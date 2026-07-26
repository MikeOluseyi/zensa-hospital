"use client";

import { useEffect, useState } from "react";

import {
  HospitalService,
  ServiceAPI
} from "@/services/services";

interface Props {

  open: boolean;

  service: HospitalService | null;

  onClose: () => void;

  onSaved: () => void;

}

export default function PriceModal({

  open,

  service,

  onClose,

  onSaved

}: Props) {

  const [price, setPrice] = useState<number>(0);

  useEffect(() => {

    if (service) {

      setPrice(service.price);

    }

  }, [service]);

  if (!open || !service) return null;

  async function save() {

  if (!service) return;

  await ServiceAPI.updatePrice(

    service.id,

    price

  );

  onSaved();

  onClose();

}

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-105">

        <div className="border-b p-6">

          <h2 className="text-xl font-semibold">

            Update Service Price

          </h2>

        </div>

        <div className="p-6 space-y-5">

          <div>

            <div className="font-semibold">

              {service.service.name}

            </div>

            <div className="text-sm text-slate-500">

              {service.service.cpt.code}

            </div>

            <div className="text-xs text-slate-400">

              {service.service.cpt.description}

            </div>

          </div>

          <div>

            <label className="text-sm font-medium">

              Price

            </label>

            <input

              type="number"

              value={price}

              onChange={(e)=>

                setPrice(Number(e.target.value))

              }

              className="mt-2 border rounded-lg px-3 py-2 w-full"

            />

          </div>

        </div>

        <div className="border-t p-6 flex justify-end gap-3">

          <button

            onClick={onClose}

            className="border rounded-lg px-4 py-2"

          >

            Cancel

          </button>

          <button

            onClick={save}

            className="bg-blue-600 text-white rounded-lg px-4 py-2"

          >

            Save

          </button>

        </div>

      </div>

    </div>

  );

}