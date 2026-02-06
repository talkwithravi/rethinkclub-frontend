import { Metadata } from 'next';
import GalaxyCanvas from '../components/GalaxyCanvas';

export const metadata: Metadata = {
    title: 'Galaxy View | RethinkClub',
    description: 'Explore your life categories in the RethinkClub Galaxy View.',
};

export default function GalaxyPage() {
    return (
        <main className="w-full h-screen bg-black">
            <h1 className="sr-only">Life Categories Galaxy</h1>
            <GalaxyCanvas />
        </main>
    );
}
