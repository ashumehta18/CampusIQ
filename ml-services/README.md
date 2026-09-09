# CampusIQ ML Phase

This directory is reserved for the future Python ML service. No model or prediction API exists yet.

## Phase 1: Feature Export

From the backend directory, configure `backend/.env` and run:

```powershell
npm run export:ml
```

The command reads academic records from MongoDB and writes:

```text
ml-services/data/student_features.csv
```

The exported features are:

- enrolled subjects
- attendance percentage
- average marks percentage
- assessments attempted
- assignments total
- assignments submitted
- late submissions

The CSV includes internal identifiers for tracing records during development. Do not commit it, publish it, or send names, emails, passwords, or other unnecessary personal data to an ML service.

## Important: No Target Label Yet

The exporter intentionally does not create `at_risk`. A model needs a trustworthy target based on a future academic outcome. Define and review that label before training.

The next learning step is data inspection with Pandas, followed by a documented label definition and a time-aware train/test split. Logistic Regression should be the first baseline model.
