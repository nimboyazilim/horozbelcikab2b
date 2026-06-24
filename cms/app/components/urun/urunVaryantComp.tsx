import { API_BASE_URL_RESIM, API_ENDPOINTS } from "@/config/api";
import api from "@/services/api";
import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { toast, useToast } from "@/hooks/use-toast";
import { Link, PencilIcon, PlusIcon } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import UrunVaryantDetayComp from "./urunVaryantDetayComp";
import Image from "next/image";

interface Varyant {
    id: number;
    fiyat: number;
    stok_kodu: string;
    varsayilan: boolean;
    varyantAdi: string;
    resim: string;
}

interface AltVaryant {
  id: number;
  varyant_ust_id: number;
  varyant_adi: string;
  varyant_sira: number;
}

interface AnaVaryant {
  id: number;
  varyant_adi: string;
  varyant_sira: number;
  varyant_ust_id: number;
  resim: string;
  altVaryantlar: AltVaryant[];
}

export default function UrunVaryantComp({ urunData }: { urunData: any }) {


    const [varyantlar, setVaryantlar] = useState<Varyant[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [anaVaryantlar, setAnaVaryantlar] = useState<AnaVaryant[]>([]);
    const [selectedVaryants, setSelectedVaryants] = useState<number[]>([]);
    const columns: ColumnDef<Varyant>[] = [
        {
            accessorKey: "id",
            header: "ID"
        },
        {
            accessorKey: "resim",
            header: "Resim",
            cell: ({ row }) => {
                return <Image src={`${API_BASE_URL_RESIM}${row.original.resim}`} alt={row.original.varyantAdi} width={32} height={32} className="w-[32px] h-[32px] rounded-lg" />
            }
        },
        {
            accessorKey: "varyantAdi",
            header: "Varyant"
        },
        {
            accessorKey: "miktar",
            header: "Miktar"
        },
        {
            accessorKey: "fiyat",
            header: "Fiyat"
        },
        {
            accessorKey: "stok_kodu",
            header: "Stok Kodu"
        },
        {
            accessorKey: "varsayilan",
            header: "Varsayılan"
        },
        {
            id: "detay",
            header: "Düzenle",
            cell: ({ row }) => (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <PencilIcon className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-screen-lg h-screen overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Varyant Detayı</DialogTitle>
                        </DialogHeader>
                        <DialogDescription></DialogDescription>
                            <UrunVaryantDetayComp varyantId={row.original.id} />
                       
                    </DialogContent>
                </Dialog>
            )
        },
        {
            id: "actions",
            header: "İşlem",
            cell: ({ row }) => (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Sil
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bu işlem geri alınamaz. Bu varyant kalıcı olarak silinecektir.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                                İptal
                            </AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(row.original.id);
                                }}
                            >
                                Sil
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        },
    ];

    const table = useReactTable({
        data: varyantlar,
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
        fetchVaryantlar();
    }, []);

    const fetchVaryantlar = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.urunVaryantListe + urunData.id);
           console.log(response.data);
            setVaryantlar(response.data.varyantlar);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Varyant verileri yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    }

    const fetchAnaVaryantlar = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(API_ENDPOINTS.anaVaryantListe);
            setAnaVaryantlar(response.data.anaVaryantlar);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: "Ana Varyant verileri yüklenirken bir hata oluştu."
            });
        } finally {
            setIsLoading(false);
        }
    }

    const urunVaryantEkle = async () => {
        try {
            const response = await api.post(API_ENDPOINTS.urunVaryantEkle, {
                urun_id: urunData.id,
                urun_ana_bilgiler: urunData.urunAnaBilgileri,
                varyant_id: selectedVaryants
            });
            toast({
                title: "Başarılı",
                description: "Varyant ekleme işlemi başarıyla tamamlandı."
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: error.response.data.message
            });
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`${API_ENDPOINTS.urunVaryantSil}/${id}`);
            toast({
                title: "Başarılı",
                description: "Varyant başarıyla silindi."
            });
            fetchVaryantlar(); // Refresh the table after deletion
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: error.response?.data?.message || "Varyant silinirken bir hata oluştu."
            });
        }
    }

    return (
        <div>

<Dialog>
  <DialogTrigger asChild>
    <Button onClick={() => {
        fetchAnaVaryantlar();
    }}>
      <PlusIcon className="w-4 h-4 mr-2" />
      Yeni Varyant
    </Button>
  </DialogTrigger>
  <DialogContent className="max-w-screen-lg h-screen overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-black">Varyant Oluştur</DialogTitle>
      <DialogDescription>
        Bu seçim ürün varyantlarını etkileyecektir
      </DialogDescription>
    </DialogHeader>
    <div>
      <Accordion type="multiple" className="w-full">
        {anaVaryantlar.map((anaVaryant) => (
          <AccordionItem key={anaVaryant.id} value={`item-${anaVaryant.id}`}>
            <AccordionTrigger className="text-black">
              {anaVaryant.varyant_adi}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col space-y-2">
                {anaVaryant.altVaryantlar.map((altVaryant) => (
                  <div key={altVaryant.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`variant-${altVaryant.id}`}
                      checked={selectedVaryants.includes(altVaryant.id)}
                      onCheckedChange={(checked) => {
                        setSelectedVaryants(prev =>
                          checked
                            ? [...prev, altVaryant.id]
                            : prev.filter(id => id !== altVaryant.id)
                        );
                      }}
                    />
                    <label
                      htmlFor={`variant-${altVaryant.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                    >
                      {altVaryant.varyant_adi}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
            
          </AccordionItem>
        ))}
      </Accordion>
      <DialogFooter className="mt-4">
        <Button onClick={urunVaryantEkle}>Kaydet</Button>
      </DialogFooter>
    </div>
  </DialogContent>
</Dialog>


            <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
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
                                    //onClick={() => router.push(`/urunler/${row.original.id}`)}
                                    className="cursor-pointer"
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
                                    Kayıt bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-end space-x-2 py-4 px-4">
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