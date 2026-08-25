import React from "react";
import Link from "next/link";
import  Card  from "@/components/ui/Card";
import  Badge from "@/components/ui/Badge";
import  Button  from "@/components/ui/Button";

export const metadata = {
    title: "À Propos | Mautoulouse",
    description: "Découvrez l'association Mautoulouse, la communauté des Mauriciens de Toulouse.",
};

export default function AboutPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-4 max-w-3xl mx-auto">
                <Badge color="navy" className="mb-2">
                    Association Loi 1901
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-[#1B3D5F]">
                    À propos de <span className="text-[#E05C3A]">Mautoulouse</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                    Mautoulouse est le point de rencontre et de partage pour la communauté
                    mauricienne résidant à Toulouse et ses environs. Nous accompagnons les
                    nouveaux arrivants et animons la vie locale à travers des événements culturels,
                    gastronomiques et sociaux.
                </p>
            </section>

            {/* Mission Cards */}
            <section className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 space-y-3 border-t-4 border-[#1B3D5F]">
                    <div className="w-12 h-12 rounded-lg bg-[#1B3D5F]/10 text-[#1B3D5F] flex items-center justify-center font-bold text-xl">
                        🤝
                    </div>
                    <h3 className="text-xl font-bold text-[#1B3D5F]">Accompagnement</h3>
                    <p className="text-sm text-slate-600">
                        Faciliter l'intégration des étudiants et jeunes actifs mauriciens à Toulouse (logement, démarches administratives, bons plans).
                    </p>
                </Card>

                <Card className="p-6 space-y-3 border-t-4 border-[#E05C3A]">
                    <div className="w-12 h-12 rounded-lg bg-[#E05C3A]/10 text-[#E05C3A] flex items-center justify-center font-bold text-xl">
                        🎉
                    </div>
                    <h3 className="text-xl font-bold text-[#1B3D5F]">Événements</h3>
                    <p className="text-sm text-slate-600">
                        Organiser des événements culturels, des repas traditionnels et des rencontres conviviales autour du Séga et des traditions mauriciennes.
                    </p>
                </Card>

                <Card className="p-6 space-y-3 border-t-4 border-[#09A572]">
                    <div className="w-12 h-12 rounded-lg bg-[#09A572]/10 text-[#09A572] flex items-center justify-center font-bold text-xl">
                        💬
                    </div>
                    <h3 className="text-xl font-bold text-[#1B3D5F]">Entraide</h3>
                    <p className="text-sm text-slate-600">
                        Offrir une plateforme de discussion sécurisée (Forum Q&R) et un réseau solidaire pour répondre à toutes vos interrogations.
                    </p>
                </Card>
            </section>

            {/* Bureau / Structure Section */}
            <section className="bg-slate-50 rounded-2xl p-8 border border-slate-200 grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                    <Badge color="teal">Notre Histoire</Badge>
                    <h2 className="text-2xl font-bold text-[#1B3D5F]">
                        Une communauté dynamique et engagée
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Née de la volonté de créer un véritable pont d'amitié entre l'île Maurice et la Ville Rose,
                        Mautoulouse rassemble aujourd'hui plus d'une centaine de membres actifs. Qu'il s'agisse de célébrer la fête nationale
                        ou d'accueillir les nouveaux étudiants lors de la rentrée universitaire, l'association continue de grandir grâce à l'implication de ses bénévoles.
                    </p>
                    <div className="pt-2 flex gap-4">
                        <Link href="/signup">
                            <Button variant="primary">Rejoindre la communauté</Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline">Nous contacter</Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="text-lg font-bold text-[#1B3D5F] border-b pb-2">
                        Bureau & Direction
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-700">Responsable de l'association :</span>
                            <span className="text-slate-900 font-medium">Sam JEBODH</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2">
                            <span className="font-semibold text-slate-700">Siège social :</span>
                            <span className="text-slate-600">Toulouse, France</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2">
                            <span className="font-semibold text-slate-700">Statut juridique :</span>
                            <span className="text-slate-600">Association Loi 1901</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}