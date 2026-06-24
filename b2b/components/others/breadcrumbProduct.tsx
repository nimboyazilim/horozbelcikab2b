import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
import Link from "next/link"
import { useTranslations, useLocale } from "next-intl";
import React from "react";


export default function BreadcrumbProduct({data,tip}: {data: {title_en: string, title_tr: string, title: string, href: string}[],tip:string}) {
    const t = useTranslations('Header');
    const locale = useLocale();
    if(tip === 'products'){
        data.unshift({ title_en:t('products'),title_tr:t('products'),title:t('products'),href:'/products'})
    }else if(tip === 'new-products'){
        data.unshift({ title_en:t('newproducts'),title_tr:t('newproducts'),title:t('newproducts'),href:'/new-products'})
    }else if(tip === 'outlet-products'){
        data.unshift({ title_en:t('outletproducts'),title_tr:t('outletproducts'),title:t('outletproducts'),href:'/outlet-products'})
    }
    const getCategoryName = (category: any) => {
        switch(locale) {
            case 'ru':
                return category.title_en;
            case 'tr':
                return category.title_tr;
            default:
                return category.title;
        }
    };
    return(
          <Breadcrumb>
              <BreadcrumbList>
                  <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                          <Link href="/">{t('home')}</Link>
                      </BreadcrumbLink>
                     
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  {data.map((item, index) => (
                    <React.Fragment key={`${item.href}-${index}`}>
                        <BreadcrumbItem>
                            <Link className="hover:underline hover:text-red-600" href={item.href}>{getCategoryName(item)}</Link>
                        </BreadcrumbItem>
                         {index < data.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
              </BreadcrumbList>
          </Breadcrumb>
    )  
}