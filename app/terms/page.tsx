import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export const metadata = {
    title: "Conditions d'Utilisation | Mautoulouse",
    description: "Conditions générales d'utilisation de la plateforme communautaire Mautoulouse.",
};

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
            <div className="border-b pb-6 space-y-2">
                <Badge color="navy" className="mb-2">Mentions & Règles</Badge>
                <h1 className="text-3xl font-bold text-[#1B3D5F]">
                    Conditions Générales d'Utilisation (CGU)
                </h1>
                <p className="text-sm text-slate-500">
                    Dernière mise à jour : Juin 2026
                </p>
            </div>

            <Card className="p-8 space-y-8 text-slate-700 leading-relaxed text-sm">
                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        1. Objet et Champ d'Application
                    </h2>
                    <p>
                        Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme <strong>Mautoulouse</strong>, accessible à l'adresse mautoulouse.fr. En naviguant sur le site ou en créant un compte, vous acceptez sans réserve les présentes conditions.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        2. Inscription et Compte Utilisateur
                    </h2>
                    <p>
                        L'accès à certaines fonctionnalités (forum de discussion, participation aux événements, publication d'annonces) nécessite la création d'un compte utilisateur.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li>L'utilisateur s'engage à fournir des informations exactes et à jour lors de son inscription.</li>
                        <li>Chaque utilisateur est responsable de la confidentialité de ses identifiants de connexion et de son mot de passe.</li>
                        <li>L'association Mautoulouse se réserve le droit de suspendre ou supprimer tout compte en cas de non-respect des présentes CGU.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        3. Règles de Conduite sur le Forum et les Espaces d'Échange
                    </h2>
                    <p>
                        Mautoulouse est un espace de partage bienveillant, d'entraide et de convivialité. À ce titre, les utilisateurs s'engagent à :
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li>Respecter les autres membres et bannir tout propos injurieux, diffamatoire, discriminatoire ou haineux.</li>
                        <li>Ne pas publier de contenus publicitaires non sollicités (spam), commerciaux ou frauduleux.</li>
                        <li>Partager des informations vérifiées et utiles pour la communauté (logement, démarches administratives, événements culturels).</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        4. Propriété Intellectuelle
                    </h2>
                    <p>
                        L'ensemble des éléments graphiques, textes, logos, et images composant la plateforme Mautoulouse sont protégés par le droit d'auteur. Toute reproduction, distribution ou modification sans autorisation préalable de l'association est strictement interdite.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        5. Limitation de Responsabilité
                    </h2>
                    <p>
                        L'association Mautoulouse s'efforce d'assurer l'exactitude des informations diffusées sur le site mais ne saurait être tenue responsable des erreurs, omissions ou des difficultés techniques rencontrées lors de l'utilisation de la plateforme.
                    </p>
                </section>

                <section className="space-y-3 pt-2">
                    <h2 className="text-lg font-bold text-[#1B3D5F] border-b pb-1">
                        6. Contact
                    </h2>
                    <p>
                        Pour toute question relative aux présentes conditions d'utilisation, vous pouvez nous contacter par e-mail à : <strong>mautoulouse@gmail.com</strong>.
                    </p>
                </section>
            </Card>
        </div>
    );
}
