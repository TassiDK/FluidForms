/**
 * Mock Danish Citizen Personas for MitID Authentication Simulation
 */

import { MitIdCitizenSession } from '../types/schema';

export const MOCK_CITIZENS: MitIdCitizenSession[] = [
  {
    authenticated: true,
    cpr: '120385-2144',
    fullName: 'Mette Frederiksen',
    address: 'Prins Jørgens Gård 11',
    city: 'København K',
    postalCode: '1218',
    email: 'mette.frederiksen@borgermail.dk',
    phone: '+45 33 92 33 00',
    authLevel: 'Substantial',
    authMethod: 'MitID App',
    authTime: new Date().toISOString(),
    sessionToken: 'mitid_sess_mf_8932410a',
  },
  {
    authenticated: true,
    cpr: '051164-1023',
    fullName: 'Lars Løkke Rasmussen',
    address: 'Sankt Annæ Plads 28',
    city: 'København K',
    postalCode: '1250',
    email: 'lars.loekke@borgermail.dk',
    phone: '+45 33 92 00 00',
    authLevel: 'High',
    authMethod: 'MitID App',
    authTime: new Date().toISOString(),
    sessionToken: 'mitid_sess_llr_774129bb',
  },
  {
    authenticated: true,
    cpr: '230791-3819',
    fullName: 'Sofie Amalie Nielsen',
    address: 'Østerbrogade 84, 2. th',
    city: 'København Ø',
    postalCode: '2100',
    email: 'sofie.nielsen@gmail.com',
    phone: '+45 28 44 91 02',
    authLevel: 'Substantial',
    authMethod: 'MitID App',
    authTime: new Date().toISOString(),
    sessionToken: 'mitid_sess_san_449102cc',
  },
];
