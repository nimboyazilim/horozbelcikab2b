'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, Trash2Icon, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { API_BASE_URL_POPUP } from '@/config/api';
import api from '@/services/api';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
} from "@tanstack/react-table"
import BreadcrumbComp from '@/app/components/breadcrumbComp';
import Image from 'next/image';

interface Popup {
    id: number;
    title_tr: string;
    description_tr: string;
    image: string;
    link: string;
    is_active: number;
    order1: number;
}

export default function PopupListePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [data, setData] = useState<Popup[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);

    const handleDelete = async () => {
        if (!selectedPopup) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Silinecek popup bulunamadı."
            });
            return;
        }

        try {
            await api.delete(`/popup/${selectedPopup.id}`, {
                _logAction: {
                    action: `Popup silindi: "${selectedPopup.title_tr}"`,
                    category: 'Popup',
                },
            } as object);
            toast({
                variant: "default",
                title: "Başarılı",
                description: "Popup başarıyla silindi."
            });
            fetchData();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Popup silinirken bir hata oluştu."
            });
        } finally {
            setIsModalOpen(false);
            setSelectedPopup(null);
        }
    };

    const openModal = (popup: Popup) => {
        setSelectedPopup(popup);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPopup(null);
    };

    const columns: ColumnDef<Popup>[] = [
        {
            accessorKey: "id",
            header: "ID"
        },
        {
            accessorKey: "image",
            header: "Görsel",
            cell: ({ row }) => (
                <div className="w-20 h-20">
                    <Image 
                        src={`${API_BASE_URL_POPUP}/${row.original.image}`} 
                        alt={row.original.title_tr} 
                        width={80} 
                        height={80}
                        className="object-cover rounded"
                    />
                </div>
            )
        },
        {
            accessorKey: "title_tr",
            header: "Başlık (TR)"
        },
        {
            accessorKey: "description_tr",
            header: "Açıklama (TR)",
            cell: ({ row }) => (
                <div className="max-w-xs truncate">
                    {row.original.description_tr}
                </div>
            )
        },
        {
            accessorKey: "link",
            header: "Link",
            cell: ({ row }) => (
                <div className="max-w-xs truncate">
                    {row.original.link || '-'}
                </div>
            )
        },
        {
            accessorKey: "is_active",
            header: "Durum",
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded text-xs ${row.original.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.original.is_active ? 'Aktif' : 'Pasif'}
                </span>
            )
        },
        {
            accessorKey: "order1",
            header: "Sıra"
        },
        {
            id: "actions",
            header: "İşlemler",
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/popup/${row.original.id}`);
                        }}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={e => {
                            e.stopPropagation();
                            openModal(row.original);
                        }}
                    >
                        <Trash2Icon className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/popup/liste');
            setData(response.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Veriler yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const breadcrumbData = [
        { name: 'Pop-up Listesi', link: '/popup/liste' },
    ];

    return (
        <div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pop-up Sil</DialogTitle>
                    </DialogHeader>
                    <p>Bu pop-up'ı silmek istediğinize emin misiniz?</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeModal}>
                            İptal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Sil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <BreadcrumbComp data={breadcrumbData} />

            <div className="flex justify-between items-center mb-4 mt-8">
                <h1 className="text-3xl font-bold tracking-tight">Pop-up Listesi</h1>
                <Link href="/popup/ekle">
                    <Button>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Yeni Pop-up Ekle
                    </Button>
                </Link>
            </div>

            <Separator className="my-4" />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Yükleniyor...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Veri bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
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
    );
}
