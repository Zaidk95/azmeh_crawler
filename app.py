from flask import Flask, request, jsonify
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

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    sentence = request.json['sentence']
    
    # Create a DataFrame for the input sentence
    new_data = pd.DataFrame({
        'Sentence': [sentence]
    })
    
    # Predict the attributes
    predicted_attributes = model.predict(new_data)
    predicted_direction = label_encoders['Direction'].inverse_transform([predicted_attributes[0][0]])[0]
    predicted_checkpoint_name = label_encoders['CheckpointName'].inverse_transform([predicted_attributes[0][1]])[0]
    predicted_status = label_encoders['Status'].inverse_transform([predicted_attributes[0][2]])[0]
    #predicted_type = label_encoders['Type'].inverse_transform([predicted_attributes[0][3]])[0]
    
    # Create the response object
    response = {
        "sentence": (sentence),
        "direction": (predicted_direction),
        "checkpoint_name": (predicted_checkpoint_name),
        "status": (predicted_status),
        "type": None
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
