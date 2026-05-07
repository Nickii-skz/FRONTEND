import { createContext, useContext, type ReactNode } from 'react'
import { container, type UseCaseContainer } from './container'

const UseCaseContext = createContext<UseCaseContainer>(container)

export function UseCaseProvider({ children }: { children: ReactNode }) {
  return (
    <UseCaseContext.Provider value={container}>
      {children}
    </UseCaseContext.Provider>
  )
}

export function useUseCases(): UseCaseContainer {
  return useContext(UseCaseContext)
}
