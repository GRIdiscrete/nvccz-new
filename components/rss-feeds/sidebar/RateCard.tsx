import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

export const RateCard = ({
  title,
  data,
  type,
  isLoading,
}: {
  title: string;
  data: any[];
  type: string;
  isLoading?: boolean;
}) => (
  <div
    className="
      w-full h-full min-h-0
      flex flex-col
      bg-slate-200 border border-slate-300 rounded-xl
      p-3 sm:p-4
      shadow-lg hover:shadow-xl transition-shadow
      font-poppins
      box-border
    "
    style={{ fontFamily: "Poppins, sans-serif" }}
  >
    {/* Header */}
    <h3 className="text-sm sm:text-base font-normal text-slate-700 mb-3 sm:mb-4 flex items-center shrink-0">
      <DollarSign className="w-4 h-4 mr-1.5 text-slate-600 flex-shrink-0" />
      <span className="truncate font-normal">{title}</span>
      {isLoading && (
        <span className="ml-2 inline-flex items-center justify-center">
          <span className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-slate-600" />
        </span>
      )}
    </h3>

    {/* List fills remaining height; scrolls if content overflows */}
    <div className="flex-1 min-h-0 overflow-auto space-y-2 sm:space-y-2.5">
      {data.map((item, index) => (
        <div
          key={index}
          className="
            flex items-center justify-between
            py-2 sm:py-2.5
            border-b border-slate-300/50 last:border-b-0
            min-h-[32px] sm:min-h-[36px]
            gap-2
          "
        >
          <div className="flex-shrink-0 min-w-0 flex-1">
            <span className="font-normal text-slate-600 text-xs sm:text-sm block truncate">
              {type === "crypto" ? item.symbol : type === "forex" ? item.pair : item.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
            <div className="text-right min-w-0">
              <span className="font-medium text-xs sm:text-sm text-slate-700 block truncate">
                {type === "crypto" ? item.price : type === "forex" ? item.rate : item.rate}
              </span>
            </div>

            <div
              className={`flex items-center text-xs sm:text-sm min-w-0 ${
                item.trend === "up"
                  ? "text-green-600"
                  : item.trend === "down"
                  ? "text-red-600"
                  : "text-slate-500"
              }`}
            >
              {item.trend === "up" ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 flex-shrink-0" />
              ) : item.trend === "down" ? (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 flex-shrink-0" />
              ) : null}
              <span className="truncate font-normal">{item.change}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
