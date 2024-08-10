import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import arabic_reshaper
from bidi.algorithm import get_display

def reshape_and_display(text):
    return get_display(arabic_reshaper.reshape(str(text)))

# Load the trained model
model = joblib.load('traffic_model_multi.pkl')

# Load the target label encoders
data = pd.read_csv('traffic_data.csv')
y = data[['Direction', 'CheckpointName', 'Status', 'Type']]

# Encode the target variables
label_encoders = {column: LabelEncoder().fit(y[column]) for column in y.columns}

# Example new sentence for prediction
new_data = pd.DataFrame({
    'Sentence': ["عناب مغلق"]
})

# Predict the attributes
predicted_attributes = model.predict(new_data)
predicted_direction = label_encoders['Direction'].inverse_transform([predicted_attributes[0][0]])[0]
predicted_checkpoint_name = label_encoders['CheckpointName'].inverse_transform([predicted_attributes[0][1]])[0]
predicted_status = label_encoders['Status'].inverse_transform([predicted_attributes[0][2]])[0]
predicted_type = label_encoders['Type'].inverse_transform([predicted_attributes[0][3]])[0]

# Display the results in Arabic
print(f"الجملة: {reshape_and_display(new_data['Sentence'][0])}")
print(f"الحالة: {reshape_and_display(predicted_status)}")
print(f"الاتجاه: {reshape_and_display(predicted_direction)}")
print(f"الاسم: {reshape_and_display(predicted_checkpoint_name)}")
print(f"النوع: {reshape_and_display(predicted_type)}")

# Format the final output as requested
final_output = f"الحالة: {reshape_and_display(predicted_status)} - الاسم: {reshape_and_display(predicted_checkpoint_name)} - الاتجاه: {reshape_and_display(predicted_direction)} - النوع: {reshape_and_display(predicted_type)}"
print(final_output)
