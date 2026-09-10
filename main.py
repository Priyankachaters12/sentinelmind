import tkinter as tk
from tkinter import messagebox, simpledialog, scrolledtext
import sqlite3
from datetime import datetime
import csv

DB = "wellness.db"

def db():
    return sqlite3.connect(DB)

def setup():
    con = db()
    cur = con.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL)""")
    cur.execute("""CREATE TABLE IF NOT EXISTS moods(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, mood INTEGER, note TEXT, date TEXT)""")
    cur.execute("""CREATE TABLE IF NOT EXISTS journals(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, text TEXT, date TEXT)""")
    cur.execute("""CREATE TABLE IF NOT EXISTS assessments(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER, test TEXT, score INTEGER, result TEXT, date TEXT)""")
    con.commit()
    con.close()

def register(name, username, password):
    if not name or not username or not password:
        return False, "Fill all fields."
    try:
        con = db()
        con.execute("INSERT INTO users(name,username,password) VALUES(?,?,?)",
                    (name, username, password))
        con.commit()
        con.close()
        return True, "Account created."
    except sqlite3.IntegrityError:
        return False, "Username already exists."

def login(username, password):
    con = db()
    row = con.execute("SELECT id,name FROM users WHERE username=? AND password=?",
                      (username, password)).fetchone()
    con.close()
    return row

def save_mood(uid, mood, note):
    con = db()
    con.execute("INSERT INTO moods(user_id,mood,note,date) VALUES(?,?,?,?)",
                (uid, mood, note, datetime.now().strftime("%Y-%m-%d %H:%M")))
    con.commit(); con.close()

def save_journal(uid, text):
    con = db()
    con.execute("INSERT INTO journals(user_id,text,date) VALUES(?,?,?)",
                (uid, text, datetime.now().strftime("%Y-%m-%d %H:%M")))
    con.commit(); con.close()

def save_assessment(uid, test, score, result):
    con = db()
    con.execute("INSERT INTO assessments(user_id,test,score,result,date) VALUES(?,?,?,?,?)",
                (uid, test, score, result, datetime.now().strftime("%Y-%m-%d %H:%M")))
    con.commit(); con.close()

def recommendations():
    return [
        "Take a short break and practice slow breathing.",
        "Keep a regular sleep and study schedule.",
        "Write down one thing you are grateful for today.",
        "Talk to someone you trust if you feel overwhelmed.",
        "Take a short walk or do gentle physical activity.",
        "Reduce unnecessary screen time before sleeping."
    ]

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("Mental Wellness Tracker")
        self.root.geometry("700x520")
        self.user_id = None
        self.user_name = ""
        self.login_screen()

    def clear(self):
        for w in self.root.winfo_children():
            w.destroy()

    def login_screen(self):
        self.clear()
        tk.Label(self.root,text="MENTAL WELLNESS TRACKER",
                 font=("Arial",24,"bold")).pack(pady=35)
        frame=tk.Frame(self.root); frame.pack()
        tk.Label(frame,text="Username").grid(row=0,column=0,pady=8)
        u=tk.Entry(frame,width=30); u.grid(row=0,column=1)
        tk.Label(frame,text="Password").grid(row=1,column=0,pady=8)
        p=tk.Entry(frame,width=30,show="*"); p.grid(row=1,column=1)

        def do_login():
            row=login(u.get().strip(),p.get())
            if row:
                self.user_id,self.user_name=row
                self.dashboard()
            else:
                messagebox.showerror("Login","Invalid username or password.")

        tk.Button(self.root,text="Login",width=18,command=do_login).pack(pady=12)
        tk.Button(self.root,text="Create Account",width=18,command=self.register_screen).pack()
        tk.Button(self.root,text="Exit",width=18,command=self.root.destroy).pack(pady=12)

    def register_screen(self):
        self.clear()
        tk.Label(self.root,text="CREATE ACCOUNT",font=("Arial",22,"bold")).pack(pady=30)
        entries=[]
        for label in ["Name","Username","Password"]:
            tk.Label(self.root,text=label).pack()
            e=tk.Entry(self.root,width=35,show="*" if label=="Password" else "")
            e.pack(pady=5); entries.append(e)
        def create():
            ok,msg=register(*[e.get().strip() for e in entries])
            if ok:
                messagebox.showinfo("Register",msg); self.login_screen()
            else: messagebox.showerror("Register",msg)
        tk.Button(self.root,text="Register",command=create,width=18).pack(pady=20)
        tk.Button(self.root,text="Back",command=self.login_screen,width=18).pack()

    def dashboard(self):
        self.clear()
        tk.Label(self.root,text=f"Welcome, {self.user_name}",
                 font=("Arial",24,"bold")).pack(pady=20)
        tk.Label(self.root,text="Your personal wellness dashboard",
                 font=("Arial",12)).pack(pady=5)
        buttons=[
            ("Daily Mood Tracker",self.mood),
            ("PHQ-9 Assessment",lambda:self.assessment("PHQ-9")),
            ("GAD-7 Assessment",lambda:self.assessment("GAD-7")),
            ("Daily Journal",self.journal),
            ("Recommendations",self.recommendations),
            ("AI Chatbot",self.chatbot),
            ("My History / Export",self.history),
            ("Logout",self.login_screen)
        ]
        frame=tk.Frame(self.root); frame.pack(pady=25)
        for i,(text,cmd) in enumerate(buttons):
            tk.Button(frame,text=text,width=24,height=2,command=cmd).grid(
                row=i//2,column=i%2,padx=10,pady=8)

    def mood(self):
        win=tk.Toplevel(self.root); win.title("Daily Mood"); win.geometry("450x350")
        tk.Label(win,text="How do you feel today?",font=("Arial",18,"bold")).pack(pady=20)
        var=tk.IntVar(value=3)
        tk.Scale(win,from_=1,to=5,orient="horizontal",variable=var,
                 label="1 = Very Low, 5 = Very Good",length=300).pack(pady=10)
        tk.Label(win,text="Optional note").pack()
        note=tk.Entry(win,width=45); note.pack(pady=10)
        def save():
            save_mood(self.user_id,var.get(),note.get())
            messagebox.showinfo("Saved","Mood saved successfully."); win.destroy()
        tk.Button(win,text="Save Mood",command=save).pack(pady=15)

    def journal(self):
        win=tk.Toplevel(self.root); win.title("Daily Journal"); win.geometry("550x450")
        tk.Label(win,text="Write about your day",font=("Arial",18,"bold")).pack(pady=15)
        box=scrolledtext.ScrolledText(win,width=60,height=15); box.pack(padx=15)
        def save():
            text=box.get("1.0","end").strip()
            if not text: messagebox.showwarning("Journal","Write something first."); return
            save_journal(self.user_id,text)
            messagebox.showinfo("Saved","Journal entry saved."); win.destroy()
        tk.Button(win,text="Save Entry",command=save).pack(pady=12)

    def assessment(self,test):
        if test=="PHQ-9":
            questions=[
                "Little interest or pleasure in doing things?",
                "Feeling down, depressed, or hopeless?",
                "Trouble sleeping or sleeping too much?",
                "Feeling tired or having little energy?",
                "Poor appetite or overeating?",
                "Feeling bad about yourself?",
                "Trouble concentrating?",
                "Moving/speaking slowly or being unusually restless?",
                "Thoughts that you would be better off dead or hurting yourself?"
            ]
            levels=["Not at all","Several days","More than half the days","Nearly every day"]
        else:
            questions=[
                "Feeling nervous, anxious or on edge?",
                "Not being able to stop or control worrying?",
                "Worrying too much about different things?",
                "Trouble relaxing?",
                "Being so restless it is hard to sit still?",
                "Becoming easily annoyed or irritable?",
                "Feeling afraid as if something awful might happen?"
            ]
            levels=["Not at all","Several days","More than half the days","Nearly every day"]

        win=tk.Toplevel(self.root); win.title(test); win.geometry("700x600")
        tk.Label(win,text=test,font=("Arial",20,"bold")).pack(pady=10)
        vars=[]
        canvas=tk.Canvas(win); scroll=tk.Scrollbar(win,orient="vertical",command=canvas.yview)
        frame=tk.Frame(canvas)
        frame.bind("<Configure>",lambda e:canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0,0),window=frame,anchor="nw"); canvas.configure(yscrollcommand=scroll.set)
        canvas.pack(side="left",fill="both",expand=True); scroll.pack(side="right",fill="y")
        for i,q in enumerate(questions,1):
            tk.Label(frame,text=f"{i}. {q}",wraplength=600,justify="left").pack(anchor="w",padx=15,pady=(12,3))
            v=tk.IntVar(value=0); vars.append(v)
            for n,l in enumerate(levels):
                tk.Radiobutton(frame,text=f"{n} - {l}",variable=v,value=n).pack(anchor="w",padx=30)
        def submit():
            score=sum(v.get() for v in vars)
            if test=="PHQ-9":
                if score<=4: result="Minimal"
                elif score<=9: result="Mild"
                elif score<=14: result="Moderate"
                elif score<=19: result="Moderately severe"
                else: result="Severe"
                maxscore=27
            else:
                if score<=4: result="Minimal"
                elif score<=9: result="Mild"
                elif score<=14: result="Moderate"
                else: result="Severe"
                maxscore=21
            save_assessment(self.user_id,test,score,result)
            messagebox.showinfo("Result",f"{test} score: {score}/{maxscore}\nLevel: {result}\n\nThis is a screening result, not a diagnosis.")
            win.destroy()
        tk.Button(win,text="Submit Assessment",command=submit).pack(pady=10)

    def recommendations(self):
        win=tk.Toplevel(self.root); win.title("Recommendations"); win.geometry("550x400")
        tk.Label(win,text="Wellness Suggestions",font=("Arial",20,"bold")).pack(pady=20)
        for i,item in enumerate(recommendations(),1):
            tk.Label(win,text=f"{i}. {item}",wraplength=480,justify="left").pack(anchor="w",padx=30,pady=7)

    def chatbot(self):
        win=tk.Toplevel(self.root); win.title("Wellness Chatbot"); win.geometry("600x500")
        tk.Label(win,text="Wellness Chatbot",font=("Arial",20,"bold")).pack(pady=10)
        chat=scrolledtext.ScrolledText(win,width=65,height=20,state="disabled"); chat.pack(padx=10)
        entry=tk.Entry(win,width=55); entry.pack(side="left",padx=10,pady=10)
        def respond():
            msg=entry.get().strip().lower()
            entry.delete(0,"end")
            if not msg:return
            if any(x in msg for x in ["sad","depressed","low"]):
                ans="I'm sorry you are feeling low. Try taking a small break, breathing slowly, and talking to someone you trust."
            elif any(x in msg for x in ["anxious","anxiety","stress","worried"]):
                ans="Try slow breathing: inhale gently, pause, and exhale slowly. Break a large task into smaller steps."
            elif "sleep" in msg:
                ans="A regular sleep schedule and reducing screen use before bed can help."
            elif any(x in msg for x in ["hello","hi","hey"]):
                ans="Hello! I'm here to provide general wellness information."
            else:
                ans="I can provide general wellness suggestions. For serious or persistent concerns, consider speaking with a qualified professional."
            chat.config(state="normal"); chat.insert("end",f"You: {msg}\nBot: {ans}\n\n"); chat.config(state="disabled")
        tk.Button(win,text="Send",command=respond).pack(side="left",pady=10)

    def history(self):
        win=tk.Toplevel(self.root); win.title("History"); win.geometry("700x550")
        box=scrolledtext.ScrolledText(win,width=80,height=28); box.pack(padx=10,pady=10)
        con=db()
        moods=con.execute("SELECT mood,note,date FROM moods WHERE user_id=? ORDER BY id DESC",(self.user_id,)).fetchall()
        tests=con.execute("SELECT test,score,result,date FROM assessments WHERE user_id=? ORDER BY id DESC",(self.user_id,)).fetchall()
        journals=con.execute("SELECT text,date FROM journals WHERE user_id=? ORDER BY id DESC",(self.user_id,)).fetchall()
        con.close()
        box.insert("end","MOOD HISTORY\n")
        for x in moods: box.insert("end",f"{x[2]} | Mood: {x[0]} | {x[1]}\n")
        box.insert("end","\nASSESSMENTS\n")
        for x in tests: box.insert("end",f"{x[3]} | {x[0]}: {x[1]} | {x[2]}\n")
        box.insert("end","\nJOURNAL ENTRIES\n")
        for x in journals: box.insert("end",f"{x[1]}\n{x[0]}\n\n")

        def export():
            path="wellness_report.csv"
            with open(path,"w",newline="",encoding="utf-8") as f:
                w=csv.writer(f); w.writerow(["Type","Date","Details"])
                for x in moods:w.writerow(["Mood",x[2],f"{x[0]} - {x[1]}"])
                for x in tests:w.writerow(["Assessment",x[3],f"{x[0]}: {x[1]} - {x[2]}"])
                for x in journals:w.writerow(["Journal",x[1],x[0]])
            messagebox.showinfo("Export",f"Report saved as {path}")
        tk.Button(win,text="Export CSV",command=export).pack(pady=5)

if __name__=="__main__":
    setup()
    root=tk.Tk()
    App(root)
    root.mainloop()
