export const environment = {
  production: true,
  msalConfig: {
    auth: {
      clientId: '6bf386f7-c08e-4ab9-88cd-57f56b590e66',
      authority: 'https://login.microsoftonline.com/c75374e8-15d8-446b-8c6c-291120e0c761/'
      // redirectUri NO va aca: se calcula en runtime con window.location.origin
      // (ver MSALInstanceFactory en app.config.ts). Asi la misma imagen Docker
      // funciona en localhost, en la IP de EC2 o en un dominio futuro sin
      // reconstruirla -- lo unico que hay que actualizar en cada entorno es
      // la lista de "Redirect URIs" permitidas en el App Registration de Azure AD.
    }
  },
  apiConfig: {
    scopes: ['api://6bf386f7-c08e-4ab9-88cd-57f56b590e66/access_as_user'],
    // Relativo a proposito: nginx (ver nginx.conf) reenvia /api/* al BFF
    // dentro de la red de docker compose, asi que el frontend nunca necesita
    // saber la IP/dominio publico del servidor.
    uri: '/api'
  }
};