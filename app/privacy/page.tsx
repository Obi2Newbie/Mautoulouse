import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export const metadata = {
    title: "Politique de Confidentialité | Mautoulouse",
    description: "Politique de protection des données personnelles de la plateforme Mautoulouse.",
};

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
            <div className="border-b pb-6 space-y-2">
                <Badge color="navy" className="mb-2">RGPD & Données</Badge>
                <h1 className="text-3xl font-bold text-[#1B3D5F]">
                    Politique de Confidentialité
                </h1>
                <p className="text-sm text-slate-500">
                    Dernière mise à jour : Juin 2026
                </p>
            </div>

            <Card className="p-8 space-y-8 text-slate-700 leading-relaxed text-sm">
                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        1. Introduction et Responsable du Traitement
                    </h2>
                    <p>
                        L'association <strong>Mautoulouse</strong> (Loi 1901), basée à Toulouse, accorde une grande importance à la protection de vos données personnelles. La présente politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations lors de votre utilisation de la plateforme web Mautoulouse.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        2. Données collectées
                    </h2>
                    <p>Dans le cadre de l'utilisation de la plateforme, nous collectons les données suivantes :</p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li><strong>Informations de compte :</strong> Nom, prénom, adresse e-mail, ville d'origine.</li>
                        <li><strong>Activités communautaires :</strong> Questions posées, réponses publiées, votes émis et participations aux événements.</li>
                        <li><strong>Données de connexion et profil :</strong> Photo d'avatar, rôle utilisateur et jetons d'authentification (JWT).</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        3. Sécurité et Hébergement des Données
                    </h2>
                    <p>
                        La sécurité de vos données est assurée via une architecture découplée et robuste :
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li><strong>Authentification :</strong> Gérée de manière sécurisée par Supabase Auth avec chiffrement et jetons JWT.</li>
                        <li><strong>Base de données :</strong> Base PostgreSQL protégée par la politique <em>Row Level Security (RLS)</em> garantissant un accès cloisonné aux données.</li>
                        <li><strong>Backend API :</strong> API FastAPI (Python) imosant une vérification systématique des rôles.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        4. Utilisation et Partage des Données
                    </h2>
                    <p>
                        Vos données sont exclusivement utilisées pour le fonctionnement de la communauté (gestion des événements, des questions du forum et administration).
                        <strong> Aucune donnée personnelle n'est vendue, cédée ou louée à des tiers à des fins commerciales.</strong>
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        5. Vos Droits et Suppression du Compte
                    </h2>
                    <p>
                        Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.
                    </p>
                    <p>
                        Vous pouvez à tout moment modifier vos informations ou procéder à la <strong>suppression définitive de votre compte</strong> depuis votre page Profil (<em>/profile</em>), ou en envoyant une demande au bureau de l'association.
                    </p>
                </section>

                <section className="space-y-3 pt-2">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        6. Contact
                    </h2>
                    <p>
                        Pour toute question concernant notre politique de confidentialité, vous pouvez contacter le bureau à l'adresse email : <strong>mautoulouse@gmail.com</strong>.
                    </p>
                </section>
            </Card>
        </div>
    );
}