import React, { useState } from 'react';
import { Download, FileCode, Archive, X, Check, Terminal, FileText } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointcCode: string;
  cCode: string;
  cppCode: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  pointcCode,
  cCode,
  cppCode,
}) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const makefileContent = `# pointC Generated Makefile
CC = gcc
CXX = g++
CFLAGS = -Wall -Wextra -O3 -march=native -flto
CXXFLAGS = -std=c++20 -Wall -Wextra -O3 -march=native -flto

all: main_c main_cpp

main_c: main.c
\t$(CC) $(CFLAGS) -o main_c main.c

main_cpp: main.cpp
\t$(CXX) $(CXXFLAGS) -o main_cpp main.cpp

clean:
\trm -f main_c main_cpp
`;

  const cmakeContent = `cmake_minimum_required(VERSION 3.20)
project(pointC_Project LANGUAGES C CXX)

set(CMAKE_C_STANDARD 17)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(main_c main.c)
add_executable(main_cpp main.cpp)
`;

  const readmeContent = `# Proyecto pointC

Generado automáticamente con **pointC IDE**.
- \`main.pointc\`: Código original en lenguaje natural estructurado.
- \`main.c\`: Código traducido y optimizado en C Estándar (C17).
- \`main.cpp\`: Código traducido en C++ Moderno (C++20).
- \`Makefile\` / \`CMakeLists.txt\`: Scripts de compilación nativa.

### Compilación rápida:
\`\`\`bash
make
./main_c
./main_cpp
\`\`\`
`;

  const handleCopy = (filename: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const files = [
    { name: 'main.pointc', label: 'Código pointC (Lenguaje Natural)', content: pointcCode, icon: FileText, color: 'text-cyan-400' },
    { name: 'main.c', label: 'Código C Estándar (C17)', content: cCode, icon: FileCode, color: 'text-blue-400' },
    { name: 'main.cpp', label: 'Código C++ Moderno (C++20)', content: cppCode, icon: FileCode, color: 'text-purple-400' },
    { name: 'Makefile', label: 'Makefile de Compilación', content: makefileContent, icon: Terminal, color: 'text-emerald-400' },
    { name: 'CMakeLists.txt', label: 'Configuración CMake', content: cmakeContent, icon: Terminal, color: 'text-amber-400' },
    { name: 'README.md', label: 'Documentación del Proyecto', content: readmeContent, icon: FileText, color: 'text-slate-400' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e1424] border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Exportar Proyecto pointC</h3>
              <p className="text-xs text-slate-400">
                Descarga los archivos generados individualmente o utilízalos en tu entorno local.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {files.map((file) => {
            const Icon = file.icon;
            return (
              <div
                key={file.name}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Icon className={`w-5 h-5 ${file.color} shrink-0`} />
                  <div className="overflow-hidden">
                    <span className="font-mono font-bold text-xs text-slate-200 block truncate">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">{file.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(file.name, file.content)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs"
                    title="Copiar contenido"
                  >
                    {copiedFile === file.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : 'Copiar'}
                  </button>
                  <button
                    onClick={() => downloadFile(file.name, file.content)}
                    className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition text-xs font-bold"
                    title="Descargar archivo"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>Compatible con GCC, Clang, MSVC y CMake</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
