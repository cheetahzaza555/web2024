const RB=ReactBootstrap;
const {Alert, Card, Button, Table} = ReactBootstrap;
const firebaseConfig = {
    apiKey: "AIzaSyBqDlHN1WXhMCy8uHduQLQuIgkGD18dVLU",
    authDomain: "web2567-8a9bd.firebaseapp.com",
    projectId: "web2567-8a9bd",
    storageBucket: "web2567-8a9bd.firebasestorage.app",
    messagingSenderId: "519737825869",
    appId: "1:519737825869:web:4a53c2bfdf174ca0819a04",
    measurementId: "G-G874BWLK64"
  };
  firebase.initializeApp(firebaseConfig);      
const db = firebase.firestore();

  

  function TextInput({label,app,value,style}){
    return <label className="form-label">
    {label}:    
     <input className="form-control" style={style}
     value={app.state[value]} onChange={(ev)=>{
         var s={};
         s[value]=ev.target.value;
         app.setState(s)}
     }></input>
   </label>;  
  }

  function EditButton({std,app}){
    return <button onClick={()=>app.edit(std)}>แก้ไข</button>
   }

   function StudentTable({data, app}){
    return <table className='table'>
    <tr>
        <td>รหัส</td>
        <td>คำนำหน้า</td>
        <td>ชื่อ</td>
        <td>สกุล</td>
        <td>email</td>
        <td>phone</td>
        </tr>
        {
          data.map((s)=><tr>
          <td>{s.id}</td>
          <td>{s.title}</td>
          <td>{s.fname}</td>
          <td>{s.lname}</td>
          <td>{s.email}</td>
          <td>{s.phone}</td>
          <td><EditButton std={s} app={app}/></td>     
          <td><DeleteButton std={s} app={app}/></td>  
          </tr> )
        }
    </table>
  }

  function DeleteButton({std,app}){    
    return <button onClick={()=>app.delete(std)}>ลบ</button>
  }

  function LoginBox(props) {
    const u = props.user;
    const app = props.app;
    if (!u) {
        return <div><Button onClick={() => app.google_login()}>Login</Button></div>
    } else {
        return <div>
            <img src={u.photoURL} />
            {u.email}<Button onClick={() => app.google_logout()}>Logout</Button></div>
    }
}

 


class App extends React.Component {
    title = (
      <Alert variant="info">
        <b>Work6 :</b> Firebase
      </Alert>
    );
    footer = (
      <div>
        By 663380486-1 นายทวีพงศ์ เหลืองปฐมชัย <br />
        College of Computing, Khon Kaen University
      </div>
    );
    state = {
        scene: 0,
        user: null,
        students: [],
        editing: false, 
        stdid: "",
        stdtitle: "",
        stdfname: "",
        stdlname: "",
        stdemail: "",
        stdphone: "",
    };
    

    edit(std) {      
        this.setState({
            stdid: std.id,
            stdtitle: std.title,
            stdfname: std.fname,
            stdlname: std.lname,
            stdemail: std.email,
            stdphone: std.phone,
            editing: true 
        });
    }
    

     render() {
        return (
            <Card>
                <Card.Header>{this.title}</Card.Header>
                <LoginBox user={this.state.user} app={this} />
                <Card.Body>
    {this.state.editing ? (
        <div>
            <TextInput label="รหัส" app={this} value="stdid" />
            <TextInput label="คำนำหน้า" app={this} value="stdtitle" />
            <TextInput label="ชื่อ" app={this} value="stdfname" />
            <TextInput label="นามสกุล" app={this} value="stdlname" />
            <TextInput label="Email" app={this} value="stdemail" />
            <TextInput label="โทรศัพท์" app={this} value="stdphone" />
            
            <Button onClick={() => this.insertData()}>บันทึก</Button>
            <Button variant="secondary" onClick={() => this.setState({ editing: false })}>ยกเลิก</Button>
        </div>
    ) : (
        <StudentTable data={this.state.students || []} app={this} />
    )}
</Card.Body>

                
                <Card.Footer>{this.footer}</Card.Footer>
            </Card>
        );
    }


      delete(std){
        if(confirm("ต้องการลบข้อมูล")){
           db.collection("students").doc(std.id).delete();
        }
    }

    insertData() {
        const { stdid, stdtitle, stdfname, stdlname, stdemail, stdphone, editing } = this.state;
    
        if (!stdtitle || !stdfname || !stdlname || !stdemail) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
    
        const studentData = {
            title: stdtitle,
            fname: stdfname,
            lname: stdlname,
            email: stdemail,
            phone: stdphone,
        };
    
        if (editing) {
            db.collection("students").doc(stdid).update(studentData)
            .then(() => {
                alert("อัปเดตข้อมูลสำเร็จ!");
                this.setState({ editing: false, stdid: "", stdtitle: "", stdfname: "", stdlname: "", stdemail: "", stdphone: "" });
                this.readData(); 
            })
            .catch((error) => console.error("❌ อัปเดตข้อมูลล้มเหลว:", error));
        } else {

            db.collection("students").doc(stdid).set(studentData)
            .then(() => {
                alert("เพิ่มข้อมูลสำเร็จ!");
                this.setState({ stdid: "", stdtitle: "", stdfname: "", stdlname: "", stdemail: "", stdphone: "" });
                this.readData();
            })
            .catch((error) => console.error("❌ เพิ่มข้อมูลล้มเหลว:", error));
        }
    }
    

  

    readData(){
        db.collection("students").get().then((querySnapshot) => {
            var stdlist=[];
            querySnapshot.forEach((doc) => {
                stdlist.push({id:doc.id,... doc.data()});                
            });
            console.log(stdlist);
            this.setState({students: stdlist});
        });
    }

    autoRead(){
        db.collection("students").onSnapshot((querySnapshot) => {
            var stdlist=[];
            querySnapshot.forEach((doc) => {
                stdlist.push({id:doc.id,... doc.data()});                
            });          
            this.setState({students: stdlist});
        });
    }

    constructor(){
        super();
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({ user: user.toJSON(), scene: 1 }); 
                this.readData(); 
            } else {
                this.setState({ user: null, scene: 0 }); 
            }
        }); 
        
    }


    google_login() {
        // Using a popup.
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope("profile");
        provider.addScope("email");
        firebase.auth().signInWithPopup(provider);
    }


    google_logout(){
        if(confirm("Are you sure?")){
          firebase.auth().signOut();
        }
    }





}


  const container = document.getElementById("myapp");
  const root = ReactDOM.createRoot(container);
  root.render(<App />);

db.collection("students").get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
      console.log(`${doc.id} =>`,doc.data());
  });
});





