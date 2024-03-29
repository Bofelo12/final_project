from flask import Flask, render_template, url_for, request
from sklearn.externals import joblib
from flask_bootstrap import Bootstrap 
import os
import numpy as np
import pickle

app = Flask(__name__, static_folder='static')
Bootstrap(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/test_result',  methods=['POST', 'GET'])
def test_result():
        age = int(request.form['age'])
        sex = int(request.form['sex'])
        trestbps = float(request.form['trestbps'])
        chol = float(request.form['chol'])
        restecg = float(request.form['restecg'])
        thalach = float(request.form['thalach'])
        exang = int(request.form['exang'])
        cp = int(request.form['cp'])
        fbs = float(request.form['fbs'])
        x = np.array([age, sex, cp, trestbps, chol, fbs, restecg,
                  thalach, exang]).reshape(1, -1)

        scaler_path = os.path.join(os.path.dirname(__file__), 'models/scaler.pkl')
        scaler = None
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)

        x = scaler.transform(x)

        model_path = os.path.join(os.path.dirname(__file__), 'models/rfc.sav')
        clf = joblib.load(model_path)

        y = clf.predict(x)
        print(y)

        # No heart disease
        if y == 0:
            return render_template('noHeartAttack.html')

        # y=1,2,4,4 are stages of heart disease
        else:
            return render_template('heartAttack.html', stage=int(y))

@app.route('/know')
def know():
    return render_template('know.html')

@app.route('/care')
def care():
    return render_template('care.html')

@app.route('/question')
def question():
    return render_template('question.html')

@app.route('/signs')
def signs():
    return render_template('signs.html')


@app.route('/procedures')
def procedures():
    return render_template('procedures.html')


@app.route('/treatment')
def treatment():
    return render_template('treatment.html')

@app.route('/diet')
def diet():
    return render_template('diet.html')

@app.route('/exercise')
def exercise():
    return render_template('exercise.html')

@app.route('/bmi')
def bmi():
    return render_template('bmi.html')

@app.route('/bmi_result',  methods=['POST', 'GET'])
def bmi_result():
    bmi = ''
    if request.method == 'POST' and 'weight' in request.form:
        weight = float(request.form.get('weight'))
        height = float(request.form.get('height'))
        bmi = calc_bmi(weight, height)
    return render_template("bmi.html",
	                        bmi=bmi)

def calc_bmi(weight, height):
    return round((weight / ((height / 100) ** 2)), 2)
    
if __name__ == '__main__':
    app.run(debug=True)