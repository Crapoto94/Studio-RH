// Correspondance entre les champs "amicaux" AD utilisés dans les règles d'alignement
// (voir AlignmentCreator.tsx AD_FIELDS, et BrutAd dans schema.prisma)
// et les vrais noms d'attributs LDAP à utiliser pour Set-ADUser / un modify LDAP.
export const AD_FIELD_TO_LDAP: Record<string, string> = {
  sam_account: 'sAMAccountName',
  display_name: 'displayName',
  given_name: 'givenName',
  surname: 'sn',
  mail: 'mail',
  title: 'title',
  department: 'department',
  company: 'company',
  manager: 'manager',
  office: 'physicalDeliveryOfficeName',
  telephone: 'telephoneNumber',
  mobile: 'mobile',
  employee_id: 'employeeID',
  ext_attr1: 'extensionAttribute1',
  ext_attr2: 'extensionAttribute2',
  ext_attr3: 'extensionAttribute3',
}

// Champs qui ne peuvent pas être alignés par un simple remplacement d'attribut
// (lecture seule côté AD, ou nécessitant un traitement spécifique type renommage/groupe).
export const AD_FIELD_READONLY = new Set([
  'distinguished_name', 'enabled', 'last_logon', 'when_created', 'member_of', 'sam_account',
])

/**
 * Résout le nom d'attribut LDAP réel à utiliser pour un champ AD "amical".
 * @param fieldAd Le champ tel que stocké dans les règles d'alignement (ex: 'office', 'matricule_ad')
 * @param matriculeAttr L'attribut LDAP configuré pour le matricule (AD_ATTRIBUTE_MATRICULE), utilisé si fieldAd === 'matricule_ad'
 * @returns Le nom d'attribut LDAP, ou null si le champ n'est pas modifiable directement.
 */
export function resolveLdapAttribute(fieldAd: string, matriculeAttr?: string): string | null {
  if (AD_FIELD_READONLY.has(fieldAd)) return null
  if (fieldAd === 'matricule_ad') return matriculeAttr || 'employeeID'
  return AD_FIELD_TO_LDAP[fieldAd] || fieldAd // fallback : on suppose que c'est déjà un nom LDAP valide
}
