// Discover Screen: DGMS Regulations, Hazard Glossary & Coal Mining Standards

export function renderDiscoverScreen(container, state) {
  container.innerHTML = `
    <div style="padding-top: 8px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <button id="btn-discover-back" class="btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
          ← Back
        </button>
        <h2 style="font-size: 18px; font-weight: 800; color: var(--text-primary);">Discover & Regulations</h2>
      </div>

      <!-- DGMS Statutory Framework Card -->
      <div style="background: linear-gradient(135deg, #5b21b6, #7c3aed); border-radius: var(--radius-xl); padding: 22px; color: #ffffff; margin-bottom: 20px; box-shadow: var(--shadow-md);">
        <span style="background: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: var(--radius-full);">
          STATUTORY COMPLIANCE
        </span>
        <h3 style="font-size: 18px; font-weight: 800; margin: 10px 0 4px 0;">Coal Mines Regulations 2017</h3>
        <p style="font-size: 12.5px; color: #ddd6fe; line-height: 1.5;">
          Official safety mandates prescribed by the Directorate General of Mines Safety (DGMS), Dhanbad, Jharkhand.
        </p>
      </div>

      <!-- Regulations Summary -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 20px;">
        <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">Key Regulations for Underground Seams:</h4>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="border-left: 3px solid #7c3aed; padding-left: 12px;">
            <div style="font-size: 13px; font-weight: 700; color: #1e293b;">CMR Regulation 136 — Spontaneous Combustion Precautions</div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              Requires regular inspection for heating, installation of automatic fire sensors on trunk belt conveyors, and clearing coal dust accumulations.
            </p>
          </div>

          <div style="border-left: 3px solid #7c3aed; padding-left: 12px;">
            <div style="font-size: 13px; font-weight: 700; color: #1e293b;">CMR Regulation 137 — Stone Dust Barriers</div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              Mandates inert stone dust (>85% non-combustible content) along roadways to prevent coal dust explosion propagation.
            </p>
          </div>

          <div style="border-left: 3px solid #7c3aed; padding-left: 12px;">
            <div style="font-size: 13px; font-weight: 700; color: #1e293b;">CMR Regulation 169 — Methane Thresholds</div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              Work must stop and power must be isolated whenever inflammable gas exceeds 1.25% in the general body of return airflow.
            </p>
          </div>
        </div>
      </div>

      <!-- Hazard Glossary -->
      <div style="background: #ffffff; border-radius: var(--radius-xl); padding: 20px; border: 1px solid #e2e8f0; box-shadow: var(--shadow-sm); margin-bottom: 24px;">
        <h4 style="font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px;">Vocational Hazard Glossary:</h4>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-md);">
            <strong style="color: #0284c7; font-size: 13px;">Fire Stink:</strong>
            <p style="font-size: 12px; color: #334155; margin-top: 2px;">
              A sweet paraffin/petroleum smell produced during early low-temperature oxidation of coal seams before open flames develop.
            </p>
          </div>

          <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-md);">
            <strong style="color: #0284c7; font-size: 13px;">Intake vs Return Airway:</strong>
            <p style="font-size: 12px; color: #334155; margin-top: 2px;">
              Intake airway supplies fresh atmospheric air from downcast shafts. Return airway carries away heat, dust, and toxic fumes toward upcast shafts. Always position upwind in intake air!
            </p>
          </div>

          <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-md);">
            <strong style="color: #0284c7; font-size: 13px;">Self-Contained Self-Rescuer (SCSR):</strong>
            <p style="font-size: 12px; color: #334155; margin-top: 2px;">
              A portable chemical oxygen generator that supplies breathable air for up to 60 minutes during mine fire evacuation.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-discover-back')?.addEventListener('click', () => {
    window.location.hash = '#home';
  });
}
