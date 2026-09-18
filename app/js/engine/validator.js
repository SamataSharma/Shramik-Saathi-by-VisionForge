// Safety Rule & PASS Technique Validator

export class SafetyValidator {
  constructor(scenario) {
    this.scenario = scenario || {
      correct_equipment: 'dcp_extinguisher',
      correct_approach: 'intake',
      pass_steps_required: ['pull', 'aim', 'squeeze', 'sweep']
    };
  }

  validateEquipment(equipmentId) {
    const isCorrect = equipmentId === this.scenario.correct_equipment;
    return {
      isValid: isCorrect,
      xpDelta: isCorrect ? 15 : -10,
      feedback: isCorrect
        ? "✓ Correct: Dry Chemical Powder (DCP) effectively smothers coal dust & conveyor belt fire."
        : "✗ Danger: Inappropriate extinguisher! Water spray on coal dust can cause explosive dispersion."
    };
  }

  validateApproach(approachId) {
    const isCorrect = approachId === this.scenario.correct_approach;
    return {
      isValid: isCorrect,
      xpDelta: isCorrect ? 0 : -20,
      feedback: isCorrect
        ? "✓ Safe Positioning: Approaching from Intake Airway keeps fresh airflow behind you."
        : "✗ Critical Violation: Downwind approach exposes you to toxic Carbon Monoxide (CO) fumes!"
    };
  }

  validatePassStep(stepId, completedSteps) {
    const validOrder = ['pull', 'aim', 'squeeze', 'sweep'];
    const expectedIndex = completedSteps.length;
    const isCorrectNext = validOrder[expectedIndex] === stepId;

    return {
      isValid: isCorrectNext,
      step: stepId,
      stepNumber: expectedIndex + 1,
      isComplete: (completedSteps.length + (isCorrectNext ? 1 : 0)) === 4
    };
  }
}
