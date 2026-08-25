import React from "react";
import Link from "next/link";
import  Card  from "@/components/ui/Card";
import  Button  from "@/components/ui/Button";
import  Badge  from "@/components/ui/Badge";

export const metadata = {
    title: "Contact & WhatsApp | Mautoulouse",
    description: "Contactez l'association Mautoulouse directement via notre numéro WhatsApp ou nos canaux de communication.",
};

export default function ContactPage() {
    const whatsappNumber = "33763855083"; 
    const whatsappMessage = encodeURIComponent(
        "Bonjour Mautoulouse, je souhaite obtenir des informations sur l'association !"
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
                <Badge color="teal" className="mb-2">Contact Direct</Badge>
                <h1 className="text-3xl font-bold text-[#1B3D5F]">
                    Entrer en contact avec <span className="text-[#09A572]">Mautoulouse</span>
                </h1>
                <p className="text-slate-600">
                    Vous avez une question sur nos événements, les adhésions ou besoin d'aide à votre arrivée à Toulouse ? Écrivez-nous directement sur WhatsApp !
                </p>
            </div>

            {/* Main WhatsApp Box */}
            <Card className="p-8 border-2 border-[#09A572]/30 bg-gradient-to-br from-emerald-50/50 to-white text-center space-y-6 shadow-sm">
                <div className="w-16 h-16 bg-[#09A572] text-white rounded-full flex items-center justify-center mx-auto text-3xl shadow-md">
                    💬
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                    <h2 className="text-2xl font-bold text-[#1B3D5F]">Discuter sur WhatsApp</h2>
                    <p className="text-sm text-slate-600">
                        Notre équipe est disponible pour répondre à vos messages rapidement. Cliquez ci-dessous pour ouvrir la conversation direct.
                    </p>
                </div>

                <div>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="lg" className="bg-[#09A572] hover:bg-[#07855c] text-white font-semibold px-8 py-3 rounded-xl">
                            Ouvrir WhatsApp ({whatsappNumber})
                        </Button>
                    </a>
                </div>
                <p className="text-xs text-slate-400">
                    Temps de réponse habituel : en quelques heures
                </p>
            </Card>

            {/* Alternative Options */}
            <div className="grid md:grid-cols-2 gap-6 pt-4">
                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-[#1B3D5F] flex items-center gap-2">
                        📧 Par Email
                    </h3>
                    <p className="text-sm text-slate-600">
                        Pour toute demande formelle, partenariats ou questions administratives.
                    </p>
                    <a
                        href="mailto:contact@mautoulouse.fr"
                        className="text-sm font-semibold text-[#E05C3A] hover:underline block"
                    >
                        mautoulouse@gmail.com
                    </a>
                </Card>

                <Card className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-[#1B3D5F] flex items-center gap-2">
                        🙋 Forum Communautaire
                    </h3>
                    <p className="text-sm text-slate-600">
                        Une question d'intégration ou d'installation ? Posez-la sur notre forum pour obtenir l'aide des autres membres.
                    </p>
                    <Link href="/forum/ask">
                        <Button variant="outline" size="sm" className="w-full">
                            Poser une question sur le forum
                        </Button>
                    </Link>
                </Card>
            </div>
        </div>
    );
}