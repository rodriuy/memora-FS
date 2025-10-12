
import type { Story, FamilyMember, Device } from './types';

export const stories: Story[] = [
  {
    id: '1',
    title: 'El primer viaje a la playa',
    narrator: 'Abuelo Juan',
    transcription: 'Recuerdo como si fuera ayer la primera vez que vi el mar. Tenía apenas seis años y mis padres me llevaron a un pequeño pueblo costero. La inmensidad azul me dejó sin palabras y el sabor salado del aire es algo que nunca olvidaré...',
    audioUrl: '',
    status: 'completed',
    imageId: 'story-1',
    isDonated: true,
  },
  {
    id: '2',
    title: 'La receta secreta de la abuela',
    narrator: 'Mamá Elena',
    transcription: 'Mi madre solía preparar un estofado cuyo aroma llenaba toda la casa. Nunca escribió la receta, decía que estaba "en sus manos y en su corazón". Pasé años a su lado, observando cada movimiento, hasta que un día me dijo: "ahora te toca a ti"...',
    audioUrl: '',
    status: 'completed',
    imageId: 'story-2',
    isDonated: false,
  },
  {
    id: '3',
    title: 'El día que conocí a tu padre',
    narrator: 'Abuela María',
    transcription: 'Fue en un baile de pueblo, bajo un cielo estrellado. Él llevaba una chaqueta de cuero y una sonrisa que iluminaba todo. Me sacó a bailar y desde ese momento, supe que mi vida había cambiado para siempre. Bailamos toda la noche...',
    audioUrl: '',
    status: 'completed',
    imageId: 'story-3',
    isDonated: false,
  },
  {
    id: '4',
    title: 'La travesura de la bicicleta',
    narrator: 'Tío Carlos',
    transcription: 'Tenía una bicicleta roja brillante, mi tesoro. Un día, decidí que podía "volar" desde la colina que había detrás de casa. No hace falta decir que el vuelo fue corto y el aterrizaje... bueno, digamos que mamá no estuvo muy contenta con el resultado.',
    audioUrl: '',
    status: 'transcribing',
    imageId: 'story-4',
    isDonated: false,
  },
];

export const familyMembers: FamilyMember[] = [
  { id: '1', name: 'Admin Pérez', role: 'Admin', avatarId: 'user-1' },
  { id: '2', name: 'Abuela María', role: 'Member', avatarId: 'user-2' },
  { id: '3', name: 'Mamá Elena', role: 'Member', avatarId: 'user-3' },
  { id: '4', name: 'Tío Carlos', role: 'Member', avatarId: 'user-4' },
];

export const devices: Device[] = [
  { id: '1', name: 'Caja del Salón', status: 'active' },
];

export const subscription = {
    tier: 'premium',
    stories: {
        current: 4,
        limit: null
    },
    photos: {
        current: 15,
        limit: null
    }
}
