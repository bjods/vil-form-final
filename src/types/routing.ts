export type FormType = 'initial' | 'follow-up' | 'agent' | 'upload'

export interface RouteParams {
  sessionId?: string
}

export interface FormRoute {
  path: string
  component: React.ComponentType<any>
  title: string
  description: string
  requiresSession?: boolean
  isPublic?: boolean
}

export interface NavigationItem {
  label: string
  path: string
  icon?: string
  adminOnly?: boolean
}

// Route definitions
export const ROUTES = {
  INITIAL: '/',
  FOLLOW_UP: '/follow-up/:sessionId',
  AGENT: '/internal',
  UPLOAD: '/upload/:sessionId',
  ADMIN: '/admin'
} as const

// Generate paths with parameters
export const generatePath = {
  followUp: (sessionId: string) => `/follow-up/${sessionId}`,
  upload: (sessionId: string) => `/upload/${sessionId}`,
  initial: () => '/',
  agent: () => '/internal',
  admin: () => '/admin'
} 