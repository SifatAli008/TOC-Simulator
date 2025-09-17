'use client'

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { Automata } from '@/types/automata'
// import { User } from 'firebase/auth' // Will be used for user authentication

export interface SavedAutomata {
  id: string
  automata: Automata
  userId: string
  name: string
  description?: string
  tags: string[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  version: number
}

export class FirebaseAutomataService {
  private static readonly COLLECTION_NAME = 'automata'

  static async saveAutomata(
    automata: Automata, 
    userId: string, 
    name: string, 
    description?: string, 
    tags: string[] = [],
    isPublic: boolean = false
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        automata,
        userId,
        name,
        description,
        tags,
        isPublic,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        version: 1
      })

      return docRef.id
    } catch (error) {
      console.error('Error saving automata:', error)
      throw new Error('Failed to save automata')
    }
  }

  static async updateAutomata(
    id: string, 
    automata: Automata, 
    name?: string, 
    description?: string, 
    tags?: string[], 
    isPublic?: boolean
  ): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      const updateData: Record<string, unknown> = {
        automata,
        updatedAt: serverTimestamp()
      }

      if (name !== undefined) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (tags !== undefined) updateData.tags = tags
      if (isPublic !== undefined) updateData.isPublic = isPublic

      await updateDoc(docRef, updateData)
    } catch (error) {
      console.error('Error updating automata:', error)
      throw new Error('Failed to update automata')
    }
  }

  static async loadAutomata(id: string): Promise<SavedAutomata | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          automata: data.automata,
          userId: data.userId,
          name: data.name,
          description: data.description,
          tags: data.tags || [],
          isPublic: data.isPublic,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          version: data.version || 1
        }
      }

      return null
    } catch (error) {
      console.error('Error loading automata:', error)
      throw new Error('Failed to load automata')
    }
  }

  static async getUserAutomata(userId: string): Promise<SavedAutomata[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const automata: SavedAutomata[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        automata.push({
          id: doc.id,
          automata: data.automata,
          userId: data.userId,
          name: data.name,
          description: data.description,
          tags: data.tags || [],
          isPublic: data.isPublic,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          version: data.version || 1
        })
      })

      return automata
    } catch (error) {
      console.error('Error loading user automata:', error)
      throw new Error('Failed to load user automata')
    }
  }

  static async getPublicAutomata(limitCount: number = 20): Promise<SavedAutomata[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isPublic', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)
      const automata: SavedAutomata[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        automata.push({
          id: doc.id,
          automata: data.automata,
          userId: data.userId,
          name: data.name,
          description: data.description,
          tags: data.tags || [],
          isPublic: data.isPublic,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          version: data.version || 1
        })
      })

      return automata
    } catch (error) {
      console.error('Error loading public automata:', error)
      throw new Error('Failed to load public automata')
    }
  }

  static async deleteAutomata(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting automata:', error)
      throw new Error('Failed to delete automata')
    }
  }

  static async searchAutomata(searchTerm: string, userId?: string): Promise<SavedAutomata[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('updatedAt', 'desc')
      )

      if (userId) {
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc')
        )
      }

      const querySnapshot = await getDocs(q)
      const automata: SavedAutomata[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const name = data.name.toLowerCase()
        const description = (data.description || '').toLowerCase()
        const tags = (data.tags || []).join(' ').toLowerCase()
        const search = searchTerm.toLowerCase()

        if (name.includes(search) || description.includes(search) || tags.includes(search)) {
          automata.push({
            id: doc.id,
            automata: data.automata,
            userId: data.userId,
            name: data.name,
            description: data.description,
            tags: data.tags || [],
            isPublic: data.isPublic,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            version: data.version || 1
          })
        }
      })

      return automata
    } catch (error) {
      console.error('Error searching automata:', error)
      throw new Error('Failed to search automata')
    }
  }
}
