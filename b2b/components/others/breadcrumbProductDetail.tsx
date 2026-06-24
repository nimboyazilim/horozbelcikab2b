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


export default function BreadcrumbProductDetail({data}: {data: {title_en: string, title_tr: string, title: string, href: string}[]}) {
    const t = useTranslations('Header');
    const locale = useLocale();
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
                          <BreadcrumbItem key={index}>
                              <Link className="hover:underline hover:text-red-600" href={item.href}>{getCategoryName(item)}</Link>
                          </BreadcrumbItem>
                          {index < data.length - 1 && <BreadcrumbSeparator />}
                     </React.Fragment>
                  ))}
              </BreadcrumbList>
          </Breadcrumb>
    )  
}