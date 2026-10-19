import { editorialAssets } from '../assets/manifest.ts';
import { messages } from './messages.ts';

export const trustItems = [
  { id: 'materials', label: messages.trust.materials, icon: 'leaf' },
  { id: 'designs', label: messages.trust.designs, icon: 'spark' },
  { id: 'delivery', label: messages.trust.delivery, icon: 'truck' },
  { id: 'danish', label: messages.trust.danish, icon: 'pin' },
] as const;

export const homeTrustItems = [
  {
    id: 'materials',
    label: messages.trust.materials,
    detail: messages.trust.materialsDetail,
    icon: 'leaf',
  },
  {
    id: 'designs',
    label: messages.trust.designs,
    detail: messages.trust.designsDetail,
    icon: 'heart',
  },
  {
    id: 'delivery',
    label: messages.trust.delivery,
    detail: messages.trust.deliveryDetail,
    icon: 'truck',
  },
  {
    id: 'danish',
    label: messages.trust.danish,
    detail: messages.trust.danishDetail,
    icon: 'flag',
  },
] as const;

export const productBenefitItems = [
  { id: 'pla', label: messages.trust.pla, icon: 'leaf' },
  { id: 'designs', label: messages.trust.designs, icon: 'spark' },
  { id: 'delivery', label: messages.trust.delivery, icon: 'truck' },
  { id: 'danish', label: messages.trust.danish, icon: 'pin' },
] as const;

export const aboutValues = [
  { id: 'production', label: messages.about.values.production, icon: 'pin' },
  { id: 'designs', label: messages.about.values.designs, icon: 'spark' },
  { id: 'care', label: messages.about.values.care, icon: 'leaf' },
  { id: 'details', label: messages.about.values.details, icon: 'dot' },
] as const;

export const processSteps = [
  {
    id: 'design',
    title: 'Vi designer',
    body: 'Idéerne starter som skitser og enkle former. Vi justerer, indtil objektet føles rigtigt i hånden.',
    image: editorialAssets.processDesign,
  },
  {
    id: 'print',
    title: 'Vi printer',
    body: 'Produkterne printes i små oplag. Overfladen kan have naturlige variationer fra printet.',
    image: editorialAssets.processPrint,
  },
  {
    id: 'pack',
    title: 'Vi pakker',
    body: 'Hvert stykke tjekkes og pakkes, så det kan sendes videre uden unødig emballage.',
    image: editorialAssets.processPack,
  },
  {
    id: 'ship',
    title: 'Vi sender',
    body: 'Ordrer sendes, når et rigtigt lager- og fragtsetup er tilkoblet. Leveringstider offentliggøres da.',
    image: editorialAssets.processShip,
  },
] as const;

export const homeBenefits = [
  {
    id: 'local',
    title: 'Lokalt greb',
    body: 'Designet i Danmark og printet i små serier, når det er faktuelt muligt for det enkelte produkt.',
  },
  {
    id: 'color',
    title: 'Farve i hverdagen',
    body: 'Legetøj, interiør og sokker, der tilføjer et lille, venligt punkt til dagen.',
  },
  {
    id: 'gifts',
    title: 'Nemme gaver',
    body: 'Små objekter og par sokker, der er ligetil at give — uden store gestusser.',
  },
] as const;

export const colorFilterOptions = [
  { id: 'beige', label: 'Beige', hex: '#E6D3B8' },
  { id: 'pink', label: 'Pink', hex: '#E8A0B0' },
  { id: 'green', label: 'Green', hex: '#2D5A43' },
  { id: 'blue', label: 'Blue', hex: '#3D6FA8' },
  { id: 'yellow', label: 'Yellow', hex: '#E3B341' },
  { id: 'brown', label: 'Brown', hex: '#A56A43' },
  { id: 'white', label: 'White', hex: '#F4F1EA' },
  { id: 'black', label: 'Black', hex: '#1F1C1A' },
] as const;

export const materialFilterOptions = [
  { id: 'PLA', label: 'PLA' },
  { id: 'bomuldsmix', label: 'Bomuldsmix' },
] as const;
