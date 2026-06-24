'use client';

import { useState, useEffect, Fragment, useCallback } from 'react';
import { RefreshCw, Download, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BreadcrumbComp from '@/app/components/breadcrumbComp';
import { LogEntry } from '@/lib/activityLogger';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api';

const CATEGORIES = [
  'Tümü',
  'Kategori',
  'Ürün',
  'Slider',
  'Katalog',
  'Haber',
  'Müşteri',
  'Sipariş',
  'Kullanıcı',
  'Banner',
  'Medya',
  'Referans',
  'Sertifika',
  'Popup',
  'Kurumsal',
  'Mikro Entegrasyon',
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function LogKayitlariPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filtered, setFiltered] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedStatus, setSelectedStatus] = useState('Tümü');

  const loadLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get(API_ENDPOINTS.activityLogs, {
        params: { limit: 100 },
      });
      setLogs(res.data.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    let result = logs;
    if (selectedCategory !== 'Tümü') {
      result = result.filter(l => l.category === selectedCategory);
    }
    if (selectedStatus !== 'Tümü') {
      result = result.filter(l => l.status === (selectedStatus === 'Başarılı' ? 'basarili' : 'basarisiz'));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        l =>
          l.action.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q) ||
          l.userEmail.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
    table.setPageIndex(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, search, selectedCategory, selectedStatus]);

  const handleExport = () => {
    const headers = ['Tarih/Saat', 'İşlem', 'Kategori', 'Kullanıcı', 'E-posta', 'Durum', 'Hata Mesajı'];
    const rows = filtered.map(l => [
      formatDate(l.timestamp),
      l.action,
      l.category,
      l.userName,
      l.userEmail,
      l.status === 'basarili' ? 'Başarılı' : 'Başarısız',
      l.errorMessage || '',
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log-kayitlari-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<LogEntry>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Tarih / Saat',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(row.getValue('timestamp'))}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Yapılan İşlem',
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('action')}</span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Alan',
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 whitespace-nowrap">
          {row.getValue('category')}
        </span>
      ),
    },
    {
      accessorKey: 'userName',
      header: 'Kullanıcı',
      cell: ({ row }) => {
        const name = row.getValue('userName') as string;
        const email = row.original.userEmail;
        return (
          <div>
            <p className="font-medium text-sm">{name || '—'}</p>
            {email && <p className="text-xs text-muted-foreground">{email}</p>}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Durum',
      cell: ({ row }) => {
        const s = row.getValue('status') as string;
        const isOk = s === 'basarili';
        return (
          <div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isOk ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isOk ? 'Başarılı' : 'Başarısız'}
            </span>
            {!isOk && row.original.errorMessage && (
              <p className="text-xs text-red-500 mt-1 max-w-xs truncate" title={row.original.errorMessage}>
                {row.original.errorMessage}
              </p>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 25 } },
    state: { sorting },
  });

  const breadcrumbData = [{ name: 'Log Kayıtları', link: '/log-kayitlari' }];

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <BreadcrumbComp data={breadcrumbData} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadLogs} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> Yenile
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="w-4 h-4 mr-1" /> CSV İndir
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="İşlem, kullanıcı veya e-posta ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-72"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alan seçin" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tümü">Tümü</SelectItem>
            <SelectItem value="Başarılı">Başarılı</SelectItem>
            <SelectItem value="Başarısız">Başarısız</SelectItem>
          </SelectContent>
        </Select>
        <span className="self-center text-sm text-muted-foreground">
          {filtered.length} kayıt gösteriliyor
        </span>
      </div>

      <div className="rounded-md border" style={{ height: 'calc(100vh - 280px)', overflow: 'auto' }}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <Fragment key={hg.id}>
                <TableRow>
                  {hg.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              </Fragment>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto opacity-40" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ClipboardList className="w-10 h-10 opacity-30" />
                    <p>Henüz log kaydı bulunmuyor.</p>
                    <p className="text-xs">CMS üzerinde işlem yapıldıkça burada görünecektir.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sayfalama */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-sm text-muted-foreground">
          Sayfa {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          {' · '}Toplam {logs.length} kayıt
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Önceki
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  );
}
