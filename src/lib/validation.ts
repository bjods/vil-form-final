import { FormState } from '../types/form';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Service Selection Validation
export const validateServices = (state: FormState) => {
  return state.services.length > 0;
};

// Address Collection Validation
export const validateAddress = (state: FormState) => {
  return state.address.trim().length > 0 && 
         state.postalCode.trim().length > 0;
};

// Budget Section Validation
export const validateBudget = (state: FormState) => {
  return state.services.every(serviceId => {
    const budget = state.budgets[serviceId] || 0;
    return budget > 0;
  });
};

// Project Scope Validation
export const validateProjectScope = (state: FormState) => {
  return state.projectScope.trim().length > 0;
};

// Start/Deadline Validation
export const validateStartDeadline = (state: FormState) => {
  return state.services.every(serviceId => {
    const dates = state.startDeadlines[serviceId] || {};
    return dates.startDate && dates.startDate.trim().length > 0;
  });
};

// Previous Provider Validation
export const validatePreviousProvider = (state: FormState) => {
  return state.previousProvider?.trim().length > 0;
};

// Previous Quotes Validation
export const validatePreviousQuotes = (state: FormState) => {
  return state.previousQuotes !== undefined;
};

// Price vs Long Term Validation
export const validatePriceVsLongTerm = (state: FormState) => {
  return state.priceVsLongTerm !== undefined;
};

// Site Challenges Validation
export const validateSiteChallenges = (state: FormState) => {
  return state.siteChallenges?.trim().length > 0;
};

// Project Success Criteria Validation
export const validateProjectSuccessCriteria = (state: FormState) => {
  return state.projectSuccessCriteria?.trim().length > 0;
};

// Personal Information Validation
export const validatePersonalInfo = (state: FormState) => {
  const { personalInfo } = state;
  return (
    personalInfo.firstName.trim().length > 0 &&
    personalInfo.lastName.trim().length > 0 &&
    emailRegex.test(personalInfo.email.trim()) &&
    personalInfo.phone.trim().length > 0
  );
};