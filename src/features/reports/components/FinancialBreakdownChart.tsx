import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';
import { resolveLanguage } from '../../../i18n/index.ts';
import { SectorBreakdown } from '../types/reports.types';

interface FinancialBreakdownChartProps {
  breakdowns: SectorBreakdown[];
  onSelectSector?: (sector: string) => void;
  selectedSector?: string | null;
}

export const FinancialBreakdownChart: React.FC<FinancialBreakdownChartProps> = ({
  breakdowns,
  onSelectSector,
  selectedSector,
}) => {
  const { t, i18n } = useTranslation();
  const lang = resolveLanguage(i18n.language);

  const chartData = breakdowns.map((b) => ({
    name: b.label[lang] || b.label.am,
    value: b.totalAmountETB,
    color: b.color,
    percentage: b.percentage,
    sectorKey: b.sector,
    projects: b.projectsCount,
  }));

  return (
    <div className="p-6 rounded-3xl bg-[#FAF6EE] dark:bg-[#14110E] border border-[#D5C8B2]/80 dark:border-[#2E2822]">
      <h3 className="text-sm font-serif font-bold text-[#14110E] dark:text-[#FAF6EE] mb-1">
        የተረጋገጡ ልገሳዎች በዘርፍ (Verified Contributions by Sector)
      </h3>
      <p className="text-xs text-[#73685B] dark:text-[#A89E90] mb-4">
        Completed donation amounts for campaigns grouped by sector
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
        {breakdowns.length === 0 ? (
          <p className="col-span-full py-8 text-center text-xs text-[#73685B] dark:text-[#A89E90]">
            ምንም የዘርፍ ድልድል መረጃ የለም
          </p>
        ) : (
          <>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="cursor-pointer transition-transform hover:scale-105"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toLocaleString()} ETB`, 'የተሰበሰበ']}
                    contentStyle={{
                      backgroundColor: '#FAF6EE',
                      borderColor: '#D5C8B2',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              {breakdowns.map((b) => {
                const isSelected = selectedSector === b.sector;
                return (
                  <div
                    key={b.sector}
                    onClick={() => onSelectSector?.(b.sector)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#9A7432] bg-[#EFE7D5]/80 dark:bg-[#201C18]'
                        : 'border-[#D5C8B2]/50 dark:border-[#2E2822] bg-[#FAF6EE]/50 dark:bg-[#181512]/60 hover:bg-[#EFE7D5]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: b.color }}
                      />
                      <div>
                        <p className="text-xs font-bold text-[#14110E] dark:text-[#FAF6EE]">
                          {b.label[lang] || b.label.am}
                        </p>
                        <p className="text-[10px] text-[#73685B] dark:text-[#A89E90]">
                          {b.projectsCount} ፕሮጀክቶች
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold font-mono text-[#1E4D38] dark:text-[#52B788]">
                        {b.percentage}%
                      </p>
                      <p className="text-[10px] text-[#73685B] dark:text-[#A89E90] font-mono">
                        {b.totalAmountETB.toLocaleString()} {t('common.currency')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinancialBreakdownChart;
