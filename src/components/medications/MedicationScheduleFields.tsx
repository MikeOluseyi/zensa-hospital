// src/components/medications/MedicationScheduleFields.tsx
"use client";

interface Props {
  orderType: "SCHEDULED" | "PRN";
  scheduledTimes: string[];
  quantityLimit: string;
  onOrderTypeChange: (type: "SCHEDULED" | "PRN") => void;
  onScheduledTimesChange: (times: string[]) => void;
  onQuantityLimitChange: (value: string) => void;
}

export default function MedicationScheduleFields({
  orderType,
  scheduledTimes,
  quantityLimit,
  onOrderTypeChange,
  onScheduledTimesChange,
  onQuantityLimitChange,
}: Props) {

  function updateTime(index: number, value: string) {
    const updated = [...scheduledTimes];
    updated[index] = value;
    onScheduledTimesChange(updated);
  }

  function addTimeField() {
    onScheduledTimesChange([...scheduledTimes, ""]);
  }

  return (
    <div className="col-span-2 space-y-3">
      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="radio"
            checked={orderType === "SCHEDULED"}
            onChange={() => onOrderTypeChange("SCHEDULED")}
          />
          Scheduled doses
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="radio"
            checked={orderType === "PRN"}
            onChange={() => onOrderTypeChange("PRN")}
          />
          As-needed (PRN)
        </label>
      </div>

      {orderType === "SCHEDULED" ? (
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-600">Dose times</label>
          {scheduledTimes.map((t, i) => (
            <input
              key={i}
              type="datetime-local"
              value={t}
              onChange={(e) => updateTime(i, e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          ))}
          <button
            type="button"
            onClick={addTimeField}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add another dose time
          </button>
        </div>
      ) : (
        <div>
          <label className="text-xs font-medium text-slate-600">Total quantity allowed</label>
          <input
            type="number"
            min={1}
            value={quantityLimit}
            onChange={(e) => onQuantityLimitChange(e.target.value)}
            placeholder="e.g. 3 ampoules"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}
    </div>
  );

}