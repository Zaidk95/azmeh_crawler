import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.multioutput import MultiOutputClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load the data
data = pd.read_csv('traffic_data.csv')

# Preprocess the data
X = data[['Sentence']]
y = data[['Direction', 'CheckpointName', 'Status', 'Type']]

# Encode the target variables
y_encoded = y.apply(LabelEncoder().fit_transform)

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# Define a column transformer to process text data
preprocessor = ColumnTransformer(
    transformers=[
        ('text', TfidfVectorizer(), 'Sentence')
    ])

# Create a pipeline that preprocesses the text and trains a multi-output classifier
model = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', MultiOutputClassifier(MultinomialNB()))
])

# Train the model
model.fit(X_train, y_train)

# Save the model
joblib.dump(model, 'traffic_model_multi.pkl')

# Evaluate the model
y_pred = model.predict(X_test)
print("Accuracy Scores:")
for i, column in enumerate(y.columns):
    print(f"{column}: {accuracy_score(y_test.iloc[:, i], y_pred[:, i])}")
    print(classification_report(y_test.iloc[:, i], y_pred[:, i]))
