/**
 * Initial Templates for Form & Workflow Engine (AutoForma Prototype)
 * Pre-configured with SurveyJS schemas and conditional multi-step workflow logic.
 */

import { FormTemplate } from '../types/schema';

export const INITIAL_TEMPLATES: FormTemplate[] = [
  {
    id: 'tpl_byggetilladelse_01',
    title: 'Ansøgning om Byggetilladelse & Miljøanmeldelse',
    category: 'Teknik & Miljø',
    description: 'Borgerservice formular til byggeprojekter. Inkluderer asbest-tjek, arealkontrol og automatisk NgDP/Digital Post kvittering.',
    version: 1,
    status: 'published',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-01T08:30:00Z',
    author: 'Teknik- og Miljøforvaltningen',
    accessControl: {
      requireMitId: true,
      mitIdType: 'citizen',
      authLevel: 'Substantial',
      autoFillFields: true,
    },
    surveyJson: {
      title: 'Ansøgning om Byggetilladelse',
      description: 'Udfyld venligst oplysningerne om det planlagte byggeprojekt.',
      showProgressBar: 'top',
      pages: [
        {
          name: 'page_applicant',
          title: '1. Ansøgeroplysninger',
          description: 'Bekræft venligst dine kontakt- og identifikationsoplysninger',
          elements: [
            {
              name: 'fullName',
              type: 'text',
              title: 'Fulde Navn',
              isRequired: true,
              colSpan: 6,
              placeholder: 'F.eks. Mette Frederiksen',
            },
            {
              name: 'cpr',
              type: 'text',
              title: 'CPR-nummer',
              isRequired: true,
              colSpan: 6,
              placeholder: 'DDMMYY-XXXX',
              inputType: 'text',
            },
            {
              name: 'applicantEmail',
              type: 'text',
              title: 'E-mailadresse for statusopdateringer',
              isRequired: true,
              colSpan: 6,
              inputType: 'email',
              placeholder: 'navn@eksempel.dk',
            },
            {
              name: 'applicantPhone',
              type: 'text',
              title: 'Telefonnummer',
              colSpan: 6,
              inputType: 'tel',
              placeholder: '+45 XX XX XX XX',
            },
            {
              name: 'propertyAddress',
              type: 'text',
              title: 'Ejendommens adresse hvor der skal bygges',
              isRequired: true,
              colSpan: 12,
              placeholder: 'Vejnavn 12, 2100 København Ø',
            },
          ],
        },
        {
          name: 'page_project',
          title: '2. Byggeriets Detaljer',
          description: 'Angiv type, areal og særlige miljøforhold',
          elements: [
            {
              name: 'projectType',
              type: 'dropdown',
              title: 'Hvilken type byggeri er der tale om?',
              isRequired: true,
              choices: [
                { value: 'tilbygning', text: 'Tilbygning / Udestue' },
                { value: 'nybyggeri', text: 'Nyt parcelhus / Enfamiliehus' },
                { value: 'carport', text: 'Carport / Garage / Skur' },
                { value: 'nedrivning', text: 'Total eller delvis nedrivning' },
              ],
            },
            {
              name: 'byggeareal',
              type: 'text',
              inputType: 'number',
              title: 'Nyt bebygget areal (i m²)',
              isRequired: true,
              placeholder: 'F.eks. 65',
            },
            {
              name: 'hasAsbestos',
              type: 'radiogroup',
              title: 'Indeholder den eksisterende bygning asbest eller PCB?',
              isRequired: true,
              choices: [
                { value: 'Yes', text: 'Ja - asbest/PCB konstateret eller mistænkt' },
                { value: 'No', text: 'Nej - ingen farlige stoffer' },
                { value: 'Unknown', text: 'Ved ikke / Skal undersøges' },
              ],
            },
            {
              name: 'asbestosPanel',
              type: 'panel',
              title: 'Særlig Miljø- & Saneringsvurdering',
              description: 'Obligatorisk afsnit når der er angivet forekomst af asbest eller PCB.',
              badgeText: 'Betinget Miljøsektion',
              dynamicCondition: {
                sourceType: 'form_field',
                fieldName: 'hasAsbestos',
                operator: 'equals',
                expectedValue: 'Yes',
              },
              visibleIf: "{hasAsbestos} = 'Yes'",
              computedTemplate: 'Saneringssag for {{propertyAddress}} registreret under ansøger {{fullName}} (CPR: {{cpr}}).',
              trueElements: [
                {
                  name: 'asbestosDetails',
                  type: 'comment',
                  title: 'Beskriv venligst asbestforekomst og saneringsplan (Sand-gren)',
                  isRequired: true,
                  placeholder: 'Angiv tagtype, rørisolering, certificeret saneringsfirma...',
                },
                {
                  name: 'asbestosSanitationCert',
                  type: 'file',
                  title: 'Upload asbestsaneringscertifikat eller miljørapport (Sand-gren)',
                  isRequired: false,
                },
              ],
              falseElements: [
                {
                  name: 'wasteDeclaration',
                  type: 'text',
                  title: 'Erklæring om standard byggeaffaldshåndtering (Falsk-gren)',
                  isRequired: false,
                  placeholder: 'Bekræft at affald afleveres på autoriseret genbrugsplads...',
                },
              ],
              elements: [
                {
                  name: 'asbestosDetails',
                  type: 'comment',
                  title: 'Beskriv venligst asbestforekomst og saneringsplan (Sand-gren)',
                  isRequired: true,
                  placeholder: 'Angiv tagtype, rørisolering, certificeret saneringsfirma...',
                },
                {
                  name: 'asbestosSanitationCert',
                  type: 'file',
                  title: 'Upload asbestsaneringscertifikat eller miljørapport (Sand-gren)',
                  isRequired: false,
                },
              ],
            },
            {
              name: 'projectDescription',
              type: 'comment',
              title: 'Kort beskrivelse af det ansøgte projekt',
              isRequired: true,
              placeholder: 'Beskriv materialevalg, højde, placering på grunden...',
            },
          ],
        },
      ],
    },
    workflowLogic: {
      steps: [
        {
          id: 'step_citizen_kvit',
          name: 'Send officiel kvittering til Borger via Digital Post (NgDP)',
          description: 'Udsendes altid til borgerens e-Boks / Borger.dk / Mit.dk',
          enabled: true,
          conditionGroup: {
            logicalOperator: 'AND',
            conditions: [
              {
                id: 'cond_always_kvit',
                field: 'cpr',
                operator: 'is_not_empty',
                value: '',
              },
            ],
          },
          actions: [
            {
              id: 'act_memo_kvit',
              name: 'Digital Post MeMo til Borger',
              type: 'DIGITAL_POST_NGDP',
              recipientType: 'CITIZEN_DIGITAL_POST',
              config: {
                ngdp: {
                  senderCvr: '29189846',
                  senderName: 'Københavns Kommune - Byggeri & Byfornyelse',
                  recipientCprOrCvrField: '{{cpr}}',
                  messageTitle: 'Kvittering for modtaget ansøgning om byggetilladelse ({{propertyAddress}})',
                  messageType: 'DIGITAL_POST',
                  mandatory: true,
                  memoDocument: {
                    mainDocumentTitle: 'Officiel Kvittering for Ansøgning',
                    bodyTemplate: `Kære {{fullName}},

Vi har modtaget din ansøgning om byggetilladelse til ejendommen {{propertyAddress}}.

Sagsoplysninger:
- Projekt: {{projectType}} ({{byggeareal}} m²)
- Registreret ansøger: {{fullName}} (CPR: {{cpr}})
- Modtaget dato: I dag

Vores forventede sagsbehandlingstid for denne sagstype er 4-6 uger. Du vil modtage yderligere afgørelser her i Digital Post.

Venlig hilsen
Københavns Kommune
Teknik- og Miljøforvaltningen`,
                    legalNotice: 'Denne kvittering er fremsendt med hjemmel i Byggeloven § 16.',
                  },
                },
              },
            },
            {
              id: 'act_email_kvit',
              name: 'Kvitterings-email til borger',
              type: 'EMAIL',
              recipientType: 'CITIZEN_EMAIL',
              config: {
                email: {
                  to: '{{applicantEmail}}',
                  fromName: 'Borgerservice Byggeri',
                  fromEmail: 'byggeri@kommune.dk',
                  subject: 'Bekræftelse: Din ansøgning er modtaget (Sagsnr: {{receiptNumber}})',
                  body: `Kære {{fullName}},

Tak for din indsendelse vedrørende {{propertyAddress}}. Vi bekræfter hermed at din ansøgning er modtaget i sagsbehandlingssystemet.

Officiel kvittering med retsvirkning er fremsendt til din offentlige Digital Post (Mit.dk / e-Boks / Borger.dk).`,
                },
              },
            },
          ],
        },
        {
          id: 'step_asbestos_alert',
          name: 'Miljøtilsyn: Hastealarm ved Asbest / PCB',
          description: 'Hvis ansøger har markeret Ja til asbest, adviseres miljøvagten',
          enabled: true,
          conditionGroup: {
            logicalOperator: 'AND',
            conditions: [
              {
                id: 'cond_asbestos_yes',
                field: 'hasAsbestos',
                operator: 'equals',
                value: 'Yes',
              },
            ],
          },
          actions: [
            {
              id: 'act_email_miljo',
              name: 'Advisering til Miljøtilsynet',
              type: 'EMAIL',
              recipientType: 'INTERNAL_EMAIL',
              config: {
                email: {
                  to: 'miljotilsyn-haster@kommune.dk',
                  fromName: 'AutoForma Workflow Engine',
                  fromEmail: 'workflow-alerts@kommune.dk',
                  subject: '[HASTE] Asbestanmeldelse modtaget på {{propertyAddress}}',
                  body: `OBS: Ansøger {{fullName}} (CPR: {{cpr}}) har anmeldt byggearbejde med asbest/PCB.

Adresse: {{propertyAddress}}
Areal: {{byggeareal}} m²
Detaljer: {{asbestosDetails}}

Tilsynet skal registrere affaldsdeklaration senest 14 dage før arbejdet påbegyndes.`,
                },
              },
            },
          ],
        },
        {
          id: 'step_large_building_esdh',
          name: 'Automatisk Journalisering i Fujitsu F2 / KMD Nova',
          description: 'Journaliseres i kommunens ESDH sagssystem',
          enabled: true,
          conditionGroup: {
            logicalOperator: 'AND',
            conditions: [
              {
                id: 'cond_byg_area',
                field: 'byggeareal',
                operator: 'greater_than',
                value: 50,
              },
            ],
          },
          actions: [
            {
              id: 'act_esdh_journal',
              name: 'Opret sag i Fujitsu F2',
              type: 'MUNICIPAL_ESDH',
              recipientType: 'DEPARTMENT_ESDH',
              config: {
                esdh: {
                  systemName: 'Fujitsu F2',
                  kleNumber: '01.00.00G01',
                  caseTitle: 'Byggesag: {{projectType}} på {{propertyAddress}} ({{byggeareal}} m²)',
                  responsibleUnit: 'Afdelingen for Byggetilladelser - Team Nord',
                },
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'tpl_daginstitution_02',
    title: 'Opskrivning til Daginstitution / Pladsanvisning',
    category: 'Børn & Unge',
    description: 'Ansøgning om vuggestue- og børnehaveplads. Inkluderer pasningsgaranti og automatisk prioriteringslogik.',
    version: 1,
    status: 'published',
    createdAt: '2026-08-20T12:00:00Z',
    updatedAt: '2026-08-30T14:15:00Z',
    author: 'Pladsanvisningen',
    accessControl: {
      requireMitId: true,
      mitIdType: 'citizen',
      authLevel: 'Substantial',
      autoFillFields: true,
    },
    surveyJson: {
      title: 'Opskrivning til Daginstitution',
      description: 'Ansøg om plads til vuggestue eller børnehave for dit barn.',
      pages: [
        {
          name: 'page_child',
          title: 'Oplysninger om Barnet & Ønsker',
          elements: [
            {
              name: 'childName',
              type: 'text',
              title: 'Barnets fulde navn',
              isRequired: true,
              placeholder: 'F.eks. Noah Frederiksen',
            },
            {
              name: 'childCpr',
              type: 'text',
              title: 'Barnets CPR-nummer',
              isRequired: true,
              placeholder: 'DDMMYY-XXXX',
            },
            {
              name: 'institutionType',
              type: 'dropdown',
              title: 'Ønsket pasningstype',
              isRequired: true,
              choices: [
                { value: 'vuggestue', text: 'Vuggestue (0-2 år)' },
                { value: 'bornerhave', text: 'Børnehave (3-5 år)' },
                { value: 'dagpleje', text: 'Kommunal Dagpleje' },
              ],
            },
            {
              name: 'desiredStartDate',
              type: 'text',
              inputType: 'date',
              title: 'Ønsket startdato for pasning',
              isRequired: true,
            },
            {
              name: 'needSpecialNeeds',
              type: 'boolean',
              title: 'Har barnet særlige behov (specialpædagogisk støtte)?',
              defaultValue: false,
            },
          ],
        },
      ],
    },
    workflowLogic: {
      steps: [
        {
          id: 'step_dag_kvit',
          name: 'NgDP Kvittering for opskrivning',
          enabled: true,
          conditionGroup: {
            logicalOperator: 'AND',
            conditions: [
              {
                id: 'cond_dag_always',
                field: 'childName',
                operator: 'is_not_empty',
                value: '',
              },
            ],
          },
          actions: [
            {
              id: 'act_dag_memo',
              name: 'Digital Post til forælder',
              type: 'DIGITAL_POST_NGDP',
              recipientType: 'CITIZEN_DIGITAL_POST',
              config: {
                ngdp: {
                  senderCvr: '29189846',
                  senderName: 'Københavns Kommune - Pladsanvisningen',
                  recipientCprOrCvrField: '{{cpr}}',
                  messageTitle: 'Bekræftelse: Opskrivning af {{childName}} til {{institutionType}}',
                  messageType: 'DIGITAL_POST',
                  mandatory: true,
                  memoDocument: {
                    mainDocumentTitle: 'Kvittering for Pladsanvisning',
                    bodyTemplate: `Kære {{fullName}},

Dit barn {{childName}} (CPR: {{childCpr}}) er hermed optaget på ventelisten til {{institutionType}}.

Ønsket startdato er registreret til: {{desiredStartDate}}.
Pasningsgarantien træder i kraft jf. Dagtilbudsloven.

Med venlig hilsen
Pladsanvisningen`,
                  },
                },
              },
            },
          ],
        },
        {
          id: 'step_special_needs_routing',
          name: 'Underretning til Pædagogisk Psykologisk Rådgivning (PPR)',
          enabled: true,
          conditionGroup: {
            logicalOperator: 'AND',
            conditions: [
              {
                id: 'cond_needs_true',
                field: 'needSpecialNeeds',
                operator: 'equals',
                value: true,
              },
            ],
          },
          actions: [
            {
              id: 'act_ppr_email',
              name: 'PPR Fagteam Notifikation',
              type: 'EMAIL',
              recipientType: 'INTERNAL_EMAIL',
              config: {
                email: {
                  to: 'ppr-fagteam@kommune.dk',
                  fromName: 'Pladsanvisningen Workflow',
                  fromEmail: 'pladsanvisning@kommune.dk',
                  subject: 'Særlige behov markeret for barn {{childName}}',
                  body: `Opmærksomhed: Ansøger {{fullName}} har markeret særligt støttebehov for barnet {{childName}} (CPR: {{childCpr}}).

Undersøg venligst ressourcekrav forud for startdato {{desiredStartDate}}.`,
                },
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'tpl_parkering_03',
    title: 'Ansøgning om Beboerparkeringslicens',
    category: 'Borgerservice',
    description: 'Automatisk udstedelse af digital beboerlicens baseret på CPR-adresse og nummerplade.',
    version: 1,
    status: 'published',
    createdAt: '2026-08-25T09:00:00Z',
    updatedAt: '2026-08-31T16:00:00Z',
    author: 'Parkering & Trafik',
    accessControl: {
      requireMitId: true,
      mitIdType: 'citizen',
      authLevel: 'Substantial',
      autoFillFields: true,
    },
    surveyJson: {
      title: 'Ansøgning om Parkeringslicens',
      description: 'Få udstedt beboerlicens til din zone.',
      pages: [
        {
          name: 'page_car',
          title: 'Køretøj & Zone',
          elements: [
            {
              name: 'licensePlate',
              type: 'text',
              title: 'Nummerplade (Registreringsnummer)',
              isRequired: true,
              placeholder: 'AB 12 345',
            },
            {
              name: 'isElectricVehicle',
              type: 'radiogroup',
              title: 'Er køretøjet en el- eller brintbil?',
              isRequired: true,
              choices: [
                { value: 'Yes', text: 'Ja (Fuld el / nul-emission - Giver grøn rabat)' },
                { value: 'No', text: 'Nej (Benzin / Diesel / Hybrid)' },
              ],
            },
            {
              name: 'parkingZone',
              type: 'dropdown',
              title: 'Vælg din parkeringszone',
              isRequired: true,
              choices: [
                { value: 'indre_by', text: 'Rød Zone (Indre By / City)' },
                { value: 'brokvarter', text: 'Grøn Zone (Nørrebro / Vesterbro / Østerbro)' },
                { value: 'amager', text: 'Gul Zone (Amager / Valby)' },
              ],
            },
          ],
        },
      ],
    },
    workflowLogic: {
      steps: [
        {
          id: 'step_license_issue',
          name: 'Udstedelse af Digital Parkeringslicens via NgDP',
          enabled: true,
          conditionGroup: {
            logicalOperator: 'AND',
            conditions: [
              {
                id: 'cond_plate',
                field: 'licensePlate',
                operator: 'is_not_empty',
                value: '',
              },
            ],
          },
          actions: [
            {
              id: 'act_parking_memo',
              name: 'Digital Parkeringslicens i Digital Post',
              type: 'DIGITAL_POST_NGDP',
              recipientType: 'CITIZEN_DIGITAL_POST',
              config: {
                ngdp: {
                  senderCvr: '29189846',
                  senderName: 'Københavns Kommune - Parkering',
                  recipientCprOrCvrField: '{{cpr}}',
                  messageTitle: 'Digital Beboerparkeringslicens for {{licensePlate}}',
                  messageType: 'DIGITAL_POST',
                  mandatory: true,
                  memoDocument: {
                    mainDocumentTitle: 'Bekræftelse på Parkeringslicens',
                    bodyTemplate: `Kære {{fullName}},

Din beboerparkeringslicens er nu aktiv for køretøjet med registreringsnummer: {{licensePlate}}.

Zone: {{parkingZone}}
Gyldig fra: I dag
Elbilrabat: {{isElectricVehicle}}

Licensen er tilknyttet din nummerplade digitalt og kontrolleres automatisk af parkeringsvagterne via scanningsbiler.

Venlig hilsen
Parkering & Trafik`,
                  },
                },
              },
            },
          ],
        },
      ],
    },
  },
];
