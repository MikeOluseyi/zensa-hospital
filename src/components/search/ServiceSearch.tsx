"use client";

import { useEffect, useState } from "react";

import { Search } from "lucide-react";

import { ServiceAPI } from "@/services/services";

interface Props {
  category?: string;
  placeholder?: string;
  onSelect: (service: any) => void;
}

export default function ServiceSearch({

  onSelect,

}: Props) {

  const [query, setQuery] = useState("");

  const [results, setResults] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (query.length < 2) {

      setResults([]);

      return;

    }

    const timeout = setTimeout(search, 300);

    return () => clearTimeout(timeout);

  }, [query]);

  async function search() {

    try {

      setLoading(true);

      const data =
        await ServiceAPI.getHospitalServices("SPECIALIST");

     const filtered = data.filter((item: any) => {

    const q = query.toLowerCase();

    return (
        item.service?.name?.toLowerCase().includes(q)
        ||
        item.service?.cpt?.code?.toLowerCase().includes(q)
        ||
        item.service?.cpt?.description?.toLowerCase().includes(q)
    );
});

      setResults(filtered);

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="relative">

      <div className="relative">

        <Search

          size={18}

          className="
            absolute
            left-3
            top-3
            text-slate-400
          "

        />

        <input

          value={query}

          onChange={(e)=>

            setQuery(e.target.value)

          }

          placeholder="Searching services"

          className="
            w-full
            border
            rounded-lg
            pl-10
            pr-4
            py-3
          "

        />

      </div>

      {query.length >= 2 && (

        <div
          className="
            absolute
            z-50
            mt-2
            w-full
            bg-white
            border
            rounded-lg
            shadow-lg
            max-h-80
            overflow-auto
          "
        >

          {loading && (

            <div className="p-4 text-sm">

              Searching...

            </div>

          )}

          {!loading &&

            results.length === 0 && (

            <div className="p-4 text-sm text-slate-500">

              No services found.

            </div>

          )}

          {results.map((service) => (

            <button

              key={service.id}

              type="button"

              onClick={() => {

                onSelect({

    hospitalServiceId: service.id,

    serviceId: service.service.id,

    name: service.service.name,

    code: service.service.cpt?.code ?? "",

    description: service.service.cpt?.description ?? ""

});

                setQuery("");

                setResults([]);

              }}

              className="
                w-full
                text-left
                p-3
                hover:bg-slate-100
                border-b
              "

            >

              <div className="font-semibold">

                {service.service.name}

              </div>

              <div className="text-xs text-slate-500">

                {service.service.cpt?.code}

              </div>

              <div className="text-sm text-slate-600">

                {service.service.cpt?.description}

              </div>

            </button>

          ))}

        </div>

      )}

    </div>

  );

}