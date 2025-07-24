import { StateCreator } from 'zustand'
import { SkillState, PlayerSkill } from '../types'

export interface SkillSlice {
  skills: SkillState
  
  // 액션들
  addSkillPage: (skillId: string, count?: number) => void
  learnSkill: (skillId: string) => boolean
  addSkillXP: (skillId: string, xp: number) => void
  levelUpSkill: (skillId: string) => boolean
  getSkill: (skillId: string) => PlayerSkill | null
}

const initialSkillState: SkillState = {
  activeSkills: [],
  passiveSkills: [],
  pagesOwned: {},
  skillPages: [], // 추가
  learnedSkills: [] // 추가
}

export const skillSlice: StateCreator<SkillSlice> = (set, get) => ({
  skills: initialSkillState,
  
  // 스킬 페이지 추가 (기획안: 3장으로 해금)
  addSkillPage: (skillId: string, count: number = 1) => {
    set((state) => ({
      skills: {
        ...state.skills,
        skillPages: [
          ...state.skills.skillPages,
          { skillId, count }
        ]
        }
    }))
  },
    
  // 스킬 학습 (기본 구현)
  learnSkill: (skillId: string) => {
        set((state) => ({
          skills: {
            ...state.skills,
        learnedSkills: [
          ...state.skills.learnedSkills,
          { skillId, level: 1, experience: 0, experienceNeeded: 100 }
        ]
          }
        }))
    return true // boolean 반환
  },
  
  // 스킬 경험치 추가 (기본 구현)
  addSkillXP: (skillId: string, xp: number) => {
    set((state) => ({
        skills: {
          ...state.skills,
        learnedSkills: state.skills.learnedSkills.map(skill =>
          skill.skillId === skillId
            ? { ...skill, experience: skill.experience + xp }
            : skill
        )
        }
    }))
  },
    
  levelUpSkill: (skillId: string) => {
    const { skills } = get()
    
    const checkAndLevelUp = (skillList: PlayerSkill[]) => {
      const skillIndex = skillList.findIndex(s => s.skillId === skillId)
      if (skillIndex >= 0) {
        const skill = skillList[skillIndex]
        if (skill.experience >= skill.experienceNeeded && skill.level < 5) {
          const newSkillList = [...skillList]
          newSkillList[skillIndex] = {
            ...skill,
            level: skill.level + 1,
            experience: skill.experience - skill.experienceNeeded,
            experienceNeeded: Math.floor(skill.experienceNeeded * 1.8)
          }
          return { success: true, newSkillList }
        }
      }
      return { success: false, newSkillList: skillList }
    }
    
    const activeResult = checkAndLevelUp(skills.activeSkills)
    if (activeResult.success) {
      set((state) => ({
        skills: { ...state.skills, activeSkills: activeResult.newSkillList }
      }))
      return true
    }
    
    const passiveResult = checkAndLevelUp(skills.passiveSkills)
    if (passiveResult.success) {
      set((state) => ({
        skills: { ...state.skills, passiveSkills: passiveResult.newSkillList }
      }))
      return true
    }
    
    return false
  },
  
  getSkill: (skillId: string) => {
    const { skills } = get()
    return (
      skills.activeSkills.find(s => s.skillId === skillId) ||
      skills.passiveSkills.find(s => s.skillId === skillId) ||
      null
    )
  }
}) 