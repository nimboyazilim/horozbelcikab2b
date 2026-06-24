import BreadcrumbNav from "@/components/others/breadcrumbNav";
import { useTranslations } from "next-intl";
import headerImages from "@/public/assets/header/header_inner_01.jpg";
import Image from "next/image";
import { generatePageMetadata } from "@/components/others/metada";
import CorporateMenu from "@/components/others/corporateMenu";

export const generateMetadata = () => generatePageMetadata("LightingText");

export default function LightingTextPage() {
    const tHeader = useTranslations("Header");
    const t = useTranslations("LightingText");

    return (
        <>
            <div className="w-full h-[300px] relative">
                <BreadcrumbNav data={[{ title: tHeader("aydinlatmaMetni"), href: "/lighting-text" }]} />
                <Image src={headerImages} alt="Header Image" className="w-full h-full object-cover" />
            </div>

            <div className="max-w-screen-2xl mx-auto p-4 mb-5 flex flex-row">
                <CorporateMenu />
                <div className="w-full">
                    <h1 className="text-2xl font-bold my-10">{t("heading")}</h1>
                    <p className="mb-6">{t("intro")}</p>
                    <p className="mb-6">{t("madde1")}</p>
                    <p className="mb-6">{t("madde2")}</p>
                    <p>{t("madde3")}</p>
                </div>
            </div>
        </>
    );
}
