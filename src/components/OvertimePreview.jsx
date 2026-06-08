import { useState } from 'react';
import { formatIndonesianDate } from '../utils/dateHelpers';
import { FloatingControls, PreviewViewport, PreviewBrandingHeader, SignatureBox } from './PreviewShared';
import { PLACEHOLDERS, TEXTS } from '../utils/constants';

export const OvertimePreview = ({ 
  state, 
  onGeneratePdf,
  companyLogoUrl,
  signatureEmployeeUrl,
  personnel,
  onRowChange,
  onGlobalDescriptionChange
}) => {
  const [zoom, setZoom] = useState(1.0);
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1.0);

  const { 
    employeeName, 
    roleName, 
    supervisorName, 
    supervisorRole,
    departmentName
  } = personnel;

  const { 
    formTitle, 
    formDescription, 
    overtimeList = [] 
  } = state;

  // Calculate totals
  const totalDays = overtimeList.length;
  const totalHours = overtimeList.reduce((acc, row) => acc + Number(row.overtimeHours || 0), 0);

  // Unit Kerja falls back to Department Name placeholder
  const unitKerja = departmentName || PLACEHOLDERS.DEPARTMENT_NAME;

  return (
    <div className="flex flex-col h-full min-h-0 relative">
      <FloatingControls 
        onExportPdf={onGeneratePdf}
        exportLabel={TEXTS.DOWNLOAD_PDF}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />

      <PreviewViewport>
        {/* Overtime Document (Target of Portrait PDF) */}
        <div 
          id="overtime-pdf-area" 
          className="print-area font-sans text-black w-[720px] mx-auto bg-white p-6 leading-relaxed"
          style={{ zoom: zoom }}
        >
          <PreviewBrandingHeader 
            type="overtime"
            companyLogoUrl={companyLogoUrl}
          />

          {/* Form Title */}
          <div className="text-center mb-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black inline-block">
              {formTitle}
            </h2>
          </div>

          {/* Description Block */}
          <div className="text-xs text-justify text-black mb-4 leading-relaxed font-medium">
            {formDescription}
          </div>

          {/* Main Overtime Table */}
          <table className="w-full border-collapse border border-black text-center text-xs mb-8 excel-table select-none">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-black">
                <th className="border border-black p-2 w-[16%]">{TEXTS.NAME}</th>
                <th className="border border-black p-2 w-[22%]">Hari / Tanggal</th>
                <th className="border border-black p-2 w-[18%]">Unit Kerja</th>
                <th className="border border-black p-2 w-[16%]">Waktu Lembur</th>
                <th className="border border-black p-2 w-[20%] text-left">Pekerjaan Yang Dikerjakan</th>
                <th className="border border-black p-2 w-[8%]">Total (Jam)</th>
              </tr>
            </thead>
            <tbody>
              {overtimeList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border border-black p-4 text-center text-gray-400 italic">
                    {TEXTS.EMPTY_OVERTIME}
                  </td>
                </tr>
              ) : (
                overtimeList.map((row, idx) => {
                  const isFirst = idx === 0;

                  return (
                    <tr key={row.id} className="hover:bg-gray-50/40">
                      {/* Vertically Merged Nama cell */}
                      {isFirst && (
                        <td 
                          rowSpan={totalDays} 
                          className="border border-black p-2 font-bold align-middle bg-white break-words"
                        >
                          {employeeName || PLACEHOLDERS.EMPLOYEE_NAME}
                        </td>
                      )}
                      
                      {/* Hari / Tanggal */}
                      <td className="border border-black p-2 font-medium">
                        {formatIndonesianDate(row.overtimeDate, true)}
                      </td>
                      
                      {/* Vertically Merged Unit Kerja cell */}
                      {isFirst && (
                        <td 
                          rowSpan={totalDays} 
                          className="border border-black p-2 align-middle bg-white break-words"
                        >
                          {unitKerja}
                        </td>
                      )}
                      
                      {/* Waktu Lembur */}
                      <td className="border border-black p-2 font-medium">
                        {row.timeRange}
                      </td>
                      
                      {/* Pekerjaan yang harus dikerjakan (auto wraps text) */}
                      <td className="border border-black p-1 text-left font-medium break-words max-w-[150px] relative">
                        <textarea
                          value={row.task}
                          onChange={e => {
                            if (state.isDescriptionSame) {
                              onGlobalDescriptionChange?.(e.target.value);
                            } else {
                              onRowChange?.(row.id, 'task', e.target.value);
                            }
                          }}
                          rows={2}
                          className="excel-cell-input focus:bg-yellow-50 pdf-hide-input w-full font-medium resize-none"
                          style={{ border: 'none', background: 'transparent', outline: 'none', padding: '2px', color: '#000', fontSize: '11px', lineHeight: '1.2', display: 'block' }}
                        />
                        <span className="pdf-value-overlay" style={{ justifyContent: 'flex-start', alignItems: 'flex-start', paddingLeft: '4px', paddingRight: '4px', paddingTop: '2px', fontSize: '11px', fontWeight: 505, whiteSpace: 'pre-wrap', textAlign: 'left' }}>{row.task}</span>
                      </td>
                      
                      {/* Total Lembur (Jam) */}
                      <td className="border border-black p-2 font-bold">
                        {row.overtimeHours}
                      </td>
                    </tr>
                  );
                })
              )}
              
              {/* Bottom Summary Row */}
              <tr className="bg-gray-100 font-bold border-t border-black">
                <td className="border border-black p-2 text-left" colSpan="3">
                  {TEXTS.TOTAL}
                </td>
                <td className="border border-black p-2 text-center" colSpan="2">
                  {totalDays} Hari
                </td>
                <td className="border border-black p-2 text-center">
                  {totalHours}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer & Signature Section */}
          <div className="grid grid-cols-2 gap-4 mt-12 text-xs">
            <SignatureBox 
              title={TEXTS.PEMOHON}
              name={employeeName || PLACEHOLDERS.EMPLOYEE_NAME}
              role={roleName || PLACEHOLDERS.ROLE}
              signatureUrl={signatureEmployeeUrl}
            />
            <SignatureBox 
              title={TEXTS.DISETUJUI_OLEH}
              name={supervisorName || PLACEHOLDERS.SUPERVISOR_NAME}
              role={supervisorRole || PLACEHOLDERS.SUPERVISOR_ROLE}
            />
          </div>

        </div>

      </PreviewViewport>
    </div>
  );
};
