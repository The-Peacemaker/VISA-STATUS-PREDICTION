from __future__ import annotations

from datetime import datetime
from pathlib import Path
import io

import pandas as pd
import streamlit as st
import streamlit.components.v1 as components

from predictor import PredictionInput, VisaProcessingEstimator


st.set_page_config(
    page_title="VisaFlow Imperial Estimator",
    page_icon="/\\",
    layout="wide",
)


def inject_css() -> None:
    css_path = Path(__file__).resolve().with_name("style.css")
    with open(css_path, "r", encoding="utf-8") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)


def inject_dynamic_cursor() -> None:
    components.html(
        """
        <script>
        (function () {
            const host = window.parent;
            const doc = host.document;
            const cursorId = 'industryCursor';
            const isTouch = host.matchMedia('(pointer: coarse)').matches;

            if (isTouch) {
                const oldCursor = doc.getElementById(cursorId);
                if (oldCursor) {
                    oldCursor.remove();
                }
                return;
            }

            let cursor = doc.getElementById(cursorId);
            if (!cursor) {
                cursor = doc.createElement('div');
                cursor.id = cursorId;
                cursor.setAttribute('data-mode', 'default');
                cursor.innerHTML = [
                    '<div class="cursor-aura"></div>',
                    '<div class="cursor-ring"></div>',
                    '<div class="cursor-cross-h"></div>',
                    '<div class="cursor-cross-v"></div>',
                    '<div class="cursor-dot"></div>',
                    '<div class="cursor-label">TRACK</div>'
                ].join('');
                doc.body.appendChild(cursor);
            }

            const aura = cursor.querySelector('.cursor-aura');
            const ring = cursor.querySelector('.cursor-ring');
            const crossH = cursor.querySelector('.cursor-cross-h');
            const crossV = cursor.querySelector('.cursor-cross-v');
            const dot = cursor.querySelector('.cursor-dot');
            const label = cursor.querySelector('.cursor-label');

            if (host.__industryCursorCleanup) {
                host.__industryCursorCleanup();
            }

            let mouseX = host.innerWidth / 2;
            let mouseY = host.innerHeight / 2;
            let dotX = mouseX;
            let dotY = mouseY;
            let ringX = mouseX;
            let ringY = mouseY;
            let auraX = mouseX;
            let auraY = mouseY;
            let magneticTarget = null;
            let cursorMode = 'default';
            let isPressed = false;
            let rafId = null;

            const interactiveTargets = [
                'button',
                'a',
                'input',
                'textarea',
                'select',
                '[role="button"]',
                '[role="radio"]',
                '[role="checkbox"]',
                '[data-baseweb="select"]',
                '[data-testid="baseButton-secondary"]',
                '[data-testid="stFileUploader"]'
            ].join(',');

            function getMode(target) {
                if (!target) {
                    return 'default';
                }

                if (target.closest([
                    'input',
                    'textarea',
                    '[contenteditable="true"]',
                    '.stTextInput input',
                    '.stNumberInput input',
                    '.stDateInput input'
                ].join(','))) {
                    return 'text';
                }

                if (target.closest([
                    '.stSelectbox',
                    'select',
                    '[data-baseweb="select"]'
                ].join(','))) {
                    return 'select';
                }

                if (target.closest('a')) {
                    return 'link';
                }

                if (target.closest([
                    'button',
                    '[role="button"]',
                    '.stButton button',
                    '.stFormSubmitButton button',
                    '[data-testid="baseButton-secondary"]'
                ].join(','))) {
                    return 'button';
                }

                return 'default';
            }

            function getLabelText(mode) {
                if (mode === 'button') return 'PRESS';
                if (mode === 'link') return 'OPEN';
                if (mode === 'text') return 'TYPE';
                if (mode === 'select') return 'PICK';
                return 'TRACK';
            }

            function setMode(mode) {
                if (cursorMode !== mode) {
                    cursorMode = mode;
                    cursor.setAttribute('data-mode', mode);
                }
                label.textContent = getLabelText(mode);
            }

            function findInteractiveTarget(x, y) {
                const leaf = doc.elementFromPoint(x, y);
                if (!leaf || !leaf.closest) {
                    return null;
                }
                return leaf.closest(interactiveTargets);
            }

            function onPointerMove(event) {
                mouseX = event.clientX;
                mouseY = event.clientY;

                const target = findInteractiveTarget(mouseX, mouseY);
                if (!target) {
                    magneticTarget = null;
                    setMode('default');
                    return;
                }

                const mode = getMode(target);
                setMode(mode);
                magneticTarget = mode === 'text' ? null : target;
            }

            function onMouseDown() {
                isPressed = true;
                cursor.classList.add('is-pressed');
            }

            function onMouseUp() {
                isPressed = false;
                cursor.classList.remove('is-pressed');
            }

            function onMouseEnter() {
                cursor.classList.add('is-visible');
            }

            function onMouseLeave() {
                cursor.classList.remove('is-visible');
                magneticTarget = null;
                setMode('default');
            }

            function onBlur() {
                cursor.classList.remove('is-visible');
                magneticTarget = null;
                setMode('default');
            }

            function onFocus() {
                cursor.classList.add('is-visible');
            }

            doc.addEventListener('pointermove', onPointerMove, { passive: true });
            doc.addEventListener('mousedown', onMouseDown, { passive: true });
            doc.addEventListener('mouseup', onMouseUp, { passive: true });
            doc.addEventListener('mouseenter', onMouseEnter, { passive: true });
            doc.addEventListener('mouseleave', onMouseLeave, { passive: true });
            host.addEventListener('blur', onBlur, { passive: true });
            host.addEventListener('focus', onFocus, { passive: true });

            function animate() {
                let targetX = mouseX;
                let targetY = mouseY;
                let magneticStrength = 0.22;

                if (magneticTarget && doc.body.contains(magneticTarget)) {
                    const rect = magneticTarget.getBoundingClientRect();
                    const cx = rect.left + (rect.width / 2);
                    const cy = rect.top + (rect.height / 2);

                    if (cursorMode === 'button') {
                        magneticStrength = 0.42;
                    } else if (cursorMode === 'link') {
                        magneticStrength = 0.34;
                    } else if (cursorMode === 'select') {
                        magneticStrength = 0.3;
                    }

                    targetX = mouseX + (cx - mouseX) * magneticStrength;
                    targetY = mouseY + (cy - mouseY) * magneticStrength;
                }

                dotX += (targetX - dotX) * 0.45;
                dotY += (targetY - dotY) * 0.45;
                ringX += (targetX - ringX) * 0.24;
                ringY += (targetY - ringY) * 0.24;
                auraX += (targetX - auraX) * 0.14;
                auraY += (targetY - auraY) * 0.14;

                const pressScale = isPressed ? 0.9 : 1;
                dot.style.transform = 'translate(' + dotX + 'px, ' + dotY + 'px) translate(-50%, -50%) scale(' + pressScale + ')';
                ring.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px) translate(-50%, -50%) scale(' + pressScale + ')';
                aura.style.transform = 'translate(' + auraX + 'px, ' + auraY + 'px) translate(-50%, -50%)';
                crossH.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px) translate(-50%, -50%)';
                crossV.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px) translate(-50%, -50%)';
                label.style.transform = 'translate(' + (ringX + 18) + 'px, ' + (ringY + 20) + 'px)';

                rafId = host.requestAnimationFrame(animate);
            }

            cursor.classList.add('is-visible');
            setMode('default');
            rafId = host.requestAnimationFrame(animate);

            host.__industryCursorCleanup = function () {
                doc.removeEventListener('pointermove', onPointerMove);
                doc.removeEventListener('mousedown', onMouseDown);
                doc.removeEventListener('mouseup', onMouseUp);
                doc.removeEventListener('mouseenter', onMouseEnter);
                doc.removeEventListener('mouseleave', onMouseLeave);
                host.removeEventListener('blur', onBlur);
                host.removeEventListener('focus', onFocus);
                if (rafId) {
                    host.cancelAnimationFrame(rafId);
                }
            };
        })();
        </script>
        """,
        height=0,
        width=0,
    )


@st.cache_resource
def get_estimator() -> VisaProcessingEstimator:
    return VisaProcessingEstimator()


def month_label(month: int) -> str:
    return datetime(2024, month, 1).strftime("%B")


def build_app() -> None:
    inject_css()
    inject_dynamic_cursor()
    estimator = get_estimator()
    options = estimator.get_form_options()

    if "prediction_history" not in st.session_state:
        st.session_state.prediction_history = []

    st.markdown(
        """
        <section class='hero'>
            <div class='brand-strip'>ANCIENT / NEO-BRUTALISTIC / IMPERIAL</div>
            <h1>VisaFlow Imperial Estimator</h1>
            <p>A complete end-to-end estimator aligned to the finalized Milestone 3 feature pipeline.</p>
        </section>
        """,
        unsafe_allow_html=True,
    )

    st.subheader("Milestone 4 Estimation Form")

    with st.form("prediction_form", clear_on_submit=False):
        col_a, col_b, col_c = st.columns([1, 1, 1])

        with col_a:
            continent = st.selectbox("Continent", options["continent"], index=1)
            education_of_employee = st.selectbox("Education of Employee", options["education_of_employee"], index=0)
            region_of_employment = st.selectbox("Region of Employment", options["region_of_employment"], index=0)
            application_month = st.selectbox(
                "Application Month",
                list(range(1, 13)),
                format_func=lambda m: f"{m:02d} - {month_label(m)}",
                index=0,
            )

        with col_b:
            has_job_experience = st.radio("Has Job Experience", options["has_job_experience"], horizontal=True, index=1)
            requires_job_training = st.radio("Requires Job Training", options["requires_job_training"], horizontal=True, index=0)
            full_time_position = st.radio("Full-Time Position", options["full_time_position"], horizontal=True, index=1)
            unit_of_wage = st.selectbox("Unit of Wage", options["unit_of_wage"], index=0)

        with col_c:
            no_of_employees = st.number_input(
                "No. of Employees",
                min_value=1,
                max_value=2_000_000,
                value=estimator.median_no_of_employees,
                step=10,
            )
            yr_of_estab = st.number_input(
                "Year of Establishment",
                min_value=1800,
                max_value=datetime.now().year,
                value=estimator.median_yr_of_estab,
                step=1,
            )
            prevailing_wage = st.number_input(
                "Prevailing Wage",
                min_value=0.0,
                max_value=1_000_000.0,
                value=float(estimator.median_prevailing_wage),
                step=50.0,
                format="%.2f",
            )

        submitted = st.form_submit_button("Estimate Processing Time")

    if submitted:
        payload = PredictionInput(
            continent=continent,
            education_of_employee=education_of_employee,
            has_job_experience=has_job_experience,
            requires_job_training=requires_job_training,
            no_of_employees=int(no_of_employees),
            yr_of_estab=int(yr_of_estab),
            region_of_employment=region_of_employment,
            prevailing_wage=float(prevailing_wage),
            unit_of_wage=unit_of_wage,
            full_time_position=full_time_position,
            application_month=int(application_month),
        )

        try:
            with st.spinner("Running model inference..."):
                days, p10, p90 = estimator.predict_days_with_interval(payload)

            st.markdown(
                f"""
                <div class='result-card'>
                    <div class='result-label'>Predicted Processing Time</div>
                    <div class='result-value'>{days:.2f} days</div>
                    <div class='result-sub'>Expected range (P10-P90): {p10:.2f} to {p90:.2f} days</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            st.session_state.prediction_history.append(
                {
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "continent": continent,
                    "education_of_employee": education_of_employee,
                    "has_job_experience": has_job_experience,
                    "requires_job_training": requires_job_training,
                    "no_of_employees": int(no_of_employees),
                    "yr_of_estab": int(yr_of_estab),
                    "region_of_employment": region_of_employment,
                    "prevailing_wage": float(prevailing_wage),
                    "unit_of_wage": unit_of_wage,
                    "full_time_position": full_time_position,
                    "application_month": int(application_month),
                    "predicted_days": days,
                    "p10_days": p10,
                    "p90_days": p90,
                }
            )

            with st.expander("Model Input Snapshot"):
                st.json(payload.__dict__)
        except Exception as exc:
            st.error(f"Prediction failed: {exc}")

    if st.session_state.prediction_history:
        st.subheader("Prediction History")
        history_df = pd.DataFrame(st.session_state.prediction_history)
        st.dataframe(history_df, width="stretch")

        csv_buffer = io.StringIO()
        history_df.to_csv(csv_buffer, index=False)
        st.download_button(
            label="Download History (CSV)",
            data=csv_buffer.getvalue(),
            file_name="prediction_history.csv",
            mime="text/csv",
        )

        if st.button("Clear History"):
            st.session_state.prediction_history = []
            st.rerun()

    st.markdown(
        """
        <footer class='footer'>
            <span>Built in Milestone 4</span>
            <span>Theme: NIGHT (#00F0F8) + IMPERIAL (#FB3640) Neo-Brutalistic</span>
        </footer>
        """,
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    build_app()
