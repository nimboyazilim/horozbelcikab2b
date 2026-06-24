'use client'
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from '@/services/api'
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/services/apiaxios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
interface Data {
  // Veri tipi tanımlaması
  Belge_Tarihi: string;
  Evrak_Tipi: string;
  Aciklama: string;
  TL_Doviz_Alacak: number;
  TL_Doviz_Alacak_Bakiye: number;
  TL_Doviz_Borc: number;
  TL_Doviz_Borc_Bakiye: number;
  Vade: string;
  // ... diğer alanlar
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
};

const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function AccountStatement() {
    const [data, setData] = useState<Data[]>([]);
    const [columns, setColumns] = useState<ColumnDef<Data, any>[]>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [ilkTarih, setIlkTarih] = useState<string>(new Date().toISOString().split('T')[0]);
    const [sonTarih, setSonTarih] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [pageSize, setPageSize] = useState(10); // Sayfa boyutu durumu
    const [pageIndex, setPageIndex] = useState(0); // Sayfa indeksi durumu

    const t = useTranslations('CariEkstre');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`${API_ENDPOINTS.cariEkstre}${ilkTarih}/${sonTarih}`);
            setData(response.data.data);
            // Dinamik sütunları ayarlama
            const dynamicColumns: ColumnDef<Data, any>[] = [
                { accessorKey: 'Belge_Tarihi', header: 'Belge Tarihi', enableColumnFilter: true },
                { accessorKey: 'Evrak_Tipi', header: 'Evrak Tipi', enableColumnFilter: true },
                { accessorKey: 'Aciklama', header: 'Açıklama', enableColumnFilter: true },
                { accessorKey: 'TL_Doviz_Alacak', header: 'Doviz Alacak', enableColumnFilter: true },
                { accessorKey: 'TL_Doviz_Alacak_Bakiye', header: 'Doviz Alacak Bakiye', enableColumnFilter: true },
                { accessorKey: 'TL_Doviz_Borc', header: 'Doviz Borç', enableColumnFilter: true },
                { accessorKey: 'TL_Doviz_Borc_Bakiye', header: 'Doviz Borç Bakiye', enableColumnFilter: true },
                { accessorKey: 'Vade', header: 'Vade', enableColumnFilter: true },
                // ... diğer sütunlar
            ];
            setColumns(dynamicColumns);
        } catch (error) {
            console.error(error);
            toast({
                title: "Hata",
                description: "Veri yüklenirken bir hata oluştu",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(), // Sayfalama modelini ekle
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            columnFilters,
            globalFilter,
            pagination: {
                pageSize,
                pageIndex,
            },
        },
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newState = updater({
                    pageIndex,
                    pageSize,
                });
                setPageIndex(newState.pageIndex);
                setPageSize(newState.pageSize);
            }
        },
        enableColumnFilters: true,
    });

    return (
        <div className="max-w-screen-xl mx-auto p-4 my-10">
            <h1>{t('cariEkstre')}</h1>
            <div className="flex flex-row gap-4 my-4">
                <Input
                    type="date"
                    value={ilkTarih}
                    onChange={(e) => setIlkTarih(e.target.value)}
                    className="w-40"
                />
                <Input
                    type="date"
                    value={sonTarih}
                    onChange={(e) => setSonTarih(e.target.value)}
                    className="w-40"
                />
                <Button onClick={fetchData} disabled={isLoading}>
                    {isLoading ? t('yukleniyor') : t('listele')}
                </Button>
            </div>
            <div className="my-4 p-4 rounded-md border" style={{ height: '500px', overflowY: 'auto' }}>
                <Table style={{ display: 'block', height: '100%', overflowY: 'auto' }}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-bold whitespace-nowrap">
                                        {header.isPlaceholder ? null : 
                                            flexRender(header.column.columnDef.header, header.getContext())}
                                        {header.column.getCanFilter() ? (
                                            <div className="mt-1">
                                                <Input
                                                    value={(header.column.getFilterValue() ?? '') as string}
                                                    onChange={(e) => header.column.setFilterValue(e.target.value)}
                                                    className="text-sm my-2 w-full h-7"
                                                    placeholder={t('filtrele')}
                                                />
                                            </div>
                                        ) : null}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <TableCell key={cell.id}>
                                        {cell.column.id === 'Belge_Tarihi' ? formatDate(cell.getValue() as string) : 
                                         cell.column.id === 'Vade' ? formatDate(cell.getValue() as string) : 
                                         cell.column.id.includes('Doviz') ? formatCurrency(cell.getValue() as number) : 
                                         flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(Number(value))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sayfa başına gösterim" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">{t('10Kayit')}</SelectItem>
                        <SelectItem value="20">{t('20Kayit')}</SelectItem>
                        <SelectItem value="50">{t('50Kayit')}</SelectItem>
                        <SelectItem value="100">{t('100Kayit')}</SelectItem>
                        <SelectItem value="200">{t('200Kayit')}</SelectItem>
                        <SelectItem value="500">{t('500Kayit')}</SelectItem>
                        <SelectItem value="1000">{t('1000Kayit')}</SelectItem>
                    </SelectContent>
                </Select>
                <div className="ml-auto flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {t('onceki')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {t('sonraki')}
                    </Button>
                </div>
            </div>
        </div>
    );
}