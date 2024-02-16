from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import string
from keras.preprocessing.sequence import pad_sequences
import pickle
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from keras.models import load_model
from flask_cors import CORS
import os
import speech_recognition as sr
from pydub import AudioSegment
from moviepy.editor import VideoFileClip

app = Flask(__name__)
CORS(app)

label_mapping = {
    0: 'Hate Speech',
    1: 'Offensive Language',
    2: 'Neither'
}

stop_words = set(stopwords.words('english'))
punctuations_list = string.punctuation

model=load_model("model.h5",compile=False)
with open('tokenizer.pkl', 'rb') as token:
    tokenizer = pickle.load(token)

def convert_video_to_text(video_path, audio_name, audio_format):
    try:
        video = VideoFileClip(video_path)
        audio = video.audio
        audio.write_audiofile(audio_name + '.' + audio_format)
        print(f"Audio extracted and saved to '{audio_name}.{audio_format}'")
        return convert_audio_to_text(audio_name + '.' + audio_format)
    except Exception as e:
        print(f"Error: {e}")
        return None

def convert_audio_to_text(audio_file_path):
    try:
        wav_file_path=""
        print(audio_file_path)
        # using wav files only currently as speechrecognition allows only .wav files
        # install ffmpeg and convert mp3 to wav using below code
        # if(".mp3" in audio_file_path):
        #     print("mp3 file")
        #     audio = AudioSegment.from_mp3(audio_file_path)
        #     wav_file_path = audio_file_path.replace('.mp3', '.wav')
        #     audio.export(wav_file_path, format="wav")
        #     print("exported to wav")
        # else:
        wav_file_path=audio_file_path
        print("extracting text")        
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_file_path) as audio_file:
            audio_data = recognizer.record(audio_file)
            text = recognizer.recognize_google(audio_data)
            return text
    except sr.UnknownValueError:
        return(jsonify({"msg":"Google Web Speech API could not understand the audio."}))
    except sr.RequestError as e:
        print(f"Could not request results from Google Web Speech API; {e}")
    except Exception as e:
        return(jsonify({"msg":"Error In detection"}))


@app.route('/predictOnMedia',methods=["POST"])
def detect_file():
    file=request.files["file"]
    print({"status":"recieved and saved"})
    file_name=file.filename
    input=""
    if('.mp3' in file_name or '.wav' in file_name):
        file.save(file_name)
        input=convert_audio_to_text(file_name)
    else:
        file.save(file_name)
        input=convert_video_to_text(file_name,file_name.split('.')[0],"wav")
    return predict([input])

@app.route('/predictOnText',methods=["POST"])
def detect_text():
    request_data=request.get_json()
    input=request_data['text']
    return predict(input)

def remove_stopwords(text):
	stop_words = stopwords.words('english')
	imp_words = []
	for word in str(text).split():
		if word not in stop_words:
			lemmatizer = WordNetLemmatizer()
			lemmatizer.lemmatize(word)
			imp_words.append(word)
	output = " ".join(imp_words)
	return output

def remove_punctuations(text):
	text=text.lower()
	temp = str.maketrans('', '', punctuations_list)
	return text.translate(temp)

def predict(input):
    print(input)
    custom_text = [remove_punctuations(text) for text in input]
    custom_text = [remove_stopwords(text) for text in custom_text]
    custom_text_seq = tokenizer.texts_to_sequences(custom_text)
    custom_text_pad = pad_sequences(custom_text_seq, maxlen=50, padding='post', truncating='post')
    custom_predictions = model.predict(custom_text_pad)
    custom_labels = np.argmax(custom_predictions, axis=1)
    mapped_custom_labels = [label_mapping[label] for label in custom_labels]
    print(mapped_custom_labels)
    return jsonify({"output":mapped_custom_labels})

if __name__ == '__main__':
    app.run(host='0.0.0.0')

