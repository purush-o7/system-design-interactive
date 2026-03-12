"use client";

import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  AreaChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/use-theme-colors";

type ChartDataPoint = Record<string, string | number>;

type ChartType = "line" | "bar" | "area" | "latency" | "throughput" | "errorRate" | "queueDepth";

interface LiveChartProps {
  type?: ChartType;
  data: ChartDataPoint[];
  dataKeys: {
    x: string;
    y: string | string[];
    label?: string | string[];
  };
  colors?: string[];
  height?: number;
  animated?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  unit?: string;
  referenceLines?: {
    y: number;
    label: string;
    color?: string;
  }[];
  className?: string;
}

const typeDefaults: Record<string, { chart: "line" | "bar" | "area"; unit: string }> = {
  latency: { chart: "line", unit: "ms" },
  throughput: { chart: "bar", unit: "rps" },
  errorRate: { chart: "line", unit: "%" },
  queueDepth: { chart: "area", unit: "msgs" },
  line: { chart: "line", unit: "" },
  bar: { chart: "bar", unit: "" },
  area: { chart: "area", unit: "" },
};

export function LiveChart({
  type = "line",
  data,
  dataKeys,
  colors: customColors,
  height = 200,
  animated = true,
  showGrid = true,
  showLegend,
  unit: customUnit,
  referenceLines,
  className,
}: LiveChartProps) {
  const themeColors = useThemeColors();

  const defaults = typeDefaults[type] ?? typeDefaults.line;
  const chartType = defaults.chart;
  const unit = customUnit ?? defaults.unit;

  const yKeys = Array.isArray(dataKeys.y) ? dataKeys.y : [dataKeys.y];
  const yLabels = dataKeys.label
    ? Array.isArray(dataKeys.label)
      ? dataKeys.label
      : [dataKeys.label]
    : yKeys;

  const defaultColorPalette = [
    themeColors.blue,
    themeColors.emerald,
    themeColors.amber,
    themeColors.violet,
    themeColors.pink,
    themeColors.cyan,
  ];

  const typeColorMap: Record<string, string> = {
    latency: themeColors.blue,
    throughput: themeColors.emerald,
    errorRate: themeColors.red,
    queueDepth: themeColors.amber,
  };

  const seriesColors =
    customColors ?? (typeColorMap[type] ? [typeColorMap[type]] : defaultColorPalette);

  const shouldShowLegend = showLegend ?? yKeys.length > 1;

  const tooltipStyle = {
    backgroundColor: themeColors.background,
    border: `1px solid ${themeColors.border}`,
    borderRadius: "0.5rem",
    color: themeColors.foreground,
    fontSize: "12px",
    padding: "8px 12px",
  };

  const commonProps = {
    data,
    margin: { top: 5, right: 10, left: 0, bottom: 5 },
  };

  const renderAxes = () => (
    <>
      {showGrid && (
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={themeColors.border}
          opacity={0.3}
        />
      )}
      <XAxis
        dataKey={dataKeys.x}
        tick={{ fill: themeColors.mutedForeground, fontSize: 11 }}
        axisLine={{ stroke: themeColors.border }}
        tickLine={false}
      />
      <YAxis
        tick={{ fill: themeColors.mutedForeground, fontSize: 11 }}
        axisLine={{ stroke: themeColors.border }}
        tickLine={false}
        unit={unit ? ` ${unit}` : ""}
        width={50}
      />
      <Tooltip contentStyle={tooltipStyle} />
      {shouldShowLegend && (
        <Legend
          wrapperStyle={{ fontSize: "11px", color: themeColors.mutedForeground }}
        />
      )}
      {referenceLines?.map((ref) => (
        <ReferenceLine
          key={ref.label}
          y={ref.y}
          label={{ value: ref.label, fill: themeColors.mutedForeground, fontSize: 10 }}
          stroke={ref.color ?? themeColors.red}
          strokeDasharray="5 5"
          strokeOpacity={0.6}
        />
      ))}
    </>
  );

  const renderChart = () => {
    if (chartType === "bar") {
      return (
        <BarChart {...commonProps}>
          {renderAxes()}
          {yKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              name={yLabels[i]}
              fill={seriesColors[i % seriesColors.length]}
              radius={[4, 4, 0, 0]}
              isAnimationActive={animated}
            />
          ))}
        </BarChart>
      );
    }

    if (chartType === "area") {
      return (
        <AreaChart {...commonProps}>
          {renderAxes()}
          {yKeys.map((key, i) => {
            const color = seriesColors[i % seriesColors.length];
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={yLabels[i]}
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={2}
                isAnimationActive={animated}
              />
            );
          })}
        </AreaChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        {renderAxes()}
        {yKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={yLabels[i]}
            stroke={seriesColors[i % seriesColors.length]}
            strokeWidth={2}
            dot={false}
            isAnimationActive={animated}
          />
        ))}
      </LineChart>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
