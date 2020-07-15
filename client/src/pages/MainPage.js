import React, { Component } from 'react';
import '../App.css';
import axios from 'axios';
import { ReactComponent as Placeholder} from '../placeholder.svg'
import { usePromiseTracker } from 'react-promise-tracker'
import { trackPromise } from 'react-promise-tracker'

class MainPage extends Component {
  constructor() {
    super();
    this.state = {
      alertVisible: false,
      type: 'q',
      name: '',
      search: false,
      results: [
        { 
          id: '',
          common_name: '',
          scientific_name: '',
          link: ''
        }
       ],
      plants: [
        { 
          _id: '',
          common_name: '',
          scientific_name: '',
          genus: '',
          family: '', 
          order: '',
          class: '', 
          division: '', 
          image: 'foo'
        }
      ]
    };
  }
  //display loading icon
  LoadingIndicator = props => {
    const {promiseInProgress} = usePromiseTracker();

    return(
      promiseInProgress &&
      <p>
        <svg height={50}>
          <Placeholder />
        </svg>
        <br></br>
        Please wait...
      </p>
    )
  }

  //get plants from collection
  getAllPlants() {
    trackPromise (
      axios.get('/getallplants')
        .then(result => {
          if (result.data !== "") {
            this.setState({ plants: result.data });
          }
        })
        .catch(error => {
          alert('Error: Could not retrieve data');
          console.log(error);
        })
    );
  }
  componentDidMount() {
    this.getAllPlants();
  }

  onChange = (event) => {
    this.setState({
      [event.target.name]: encodeURIComponent(event.target.value)
    });
  }
  //search for plants
  search = (event) => {
    event.preventDefault();
    this.setState({ search: false });

    const query = `/search?type=${this.state.type}&name=${this.state.name}`;

    trackPromise(
      axios.get(query)
        .then(result => {
          if (result.data === '' || result.data === undefined) {
            this.setState({ alertVisible: true });
            alert('Plant not found');
          } else {
            this.setState({ results: result.data });
            this.setState({ search: true });
          }
        })
        .catch(error => {
          alert('Error: ', error);
        })
    );
    
    this.displayResults();
  }
  displayResults() {
    if (this.state.search) {
      return(<div className="App-table">
      <table>
        <thead>
          <th>Common name</th>
          <th>Scientific name</th>
        </thead>
        <tbody>
          {this.state.results.map(this.displayResultRows, this)}
        </tbody>
      </table>
    </div>)
    }
  }
  displayResultRows(results) {
    var result_common_name = "N/A";
    if (results.common_name !== null) {
      result_common_name = results.common_name.charAt(0).toUpperCase()+results.common_name.slice(1);
    }
    return(
      <tr>
        <td>{result_common_name}</td>
        <td>{results.scientific_name}</td>
        <td><button onClick={this.addPlant(results.link)}>Add</button></td>
      </tr>
    );
  }

  addPlant = (link) => () => {
    const query = `/add?link=${link}`;

    trackPromise(
      axios.get(query)
        .then(result => {
          this.getAllPlants();
        })
        .catch(error => {
          alert('Error: ', error);
        })
    );
  }
  
  deletePlant = (id) => () => {
    if (window.confirm("Do you want to delete this plant from your list?")) {
      const query = `/delete?id=${id}`;

      axios.get(query)
        .then(result => {
          this.getAllPlants();
        })
        .catch(error => {
          alert('Error: ', error);
        });
    }
  }

  displayPlants(data) {
    var image = <Placeholder />;
    if (data.image !== '') {
      image = <a href={data.image}><img src={data.image} alt="placeholder"></img></a>
    }
    
    return (
      <tr>
        <td>{data.common_name}</td>
        <td>{data.scientific_name}</td>
        <td>{data.genus}</td>
        <td>{data.family}</td>
        <td>{data.order}</td>
        <td>{data.class}</td>
        <td>{data.division}</td>
        <td>{image}</td>
        <td><button onClick={this.deletePlant(data._id)}>Delete</button></td>
      </tr>
    )
  }
  render() {
    const data = this.state.plants;

    return (
      <div className="App">
        <header className="App-header">
          <h1>Planter</h1>
          <p>
            Your plant bookmarker
          </p>
        </header>
        <div className="search">
          <form onSubmit={this.search}>
            <div>
              <label>Search by category</label>
              <select name="type" value={this.state.type} onChange={this.onChange}>
                <option value="q">All categories</option>
                <option value="common_name">Common name</option>
                <option value="scientific_name">Scientific name</option>
                <option value="genus">Genus</option>
                <option value="family">Family</option>
                <option value="order">Order</option>
                <option value="class">Class</option>
                <option value="division">Division</option>
              </select>
            </div>
            <div>
              <label>Keywords</label>
              <input type="text" name="name" onChange={this.onChange}/><br/>
              <input type="submit" value="Search"/>
            </div>
            <this.LoadingIndicator/>
          </form>
        </div>
        {this.displayResults()}
        <div className="App-table">
          <table>
            <thead>
              <th>Common name</th>
              <th>Scientific name</th>
              <th>Genus</th>
              <th>Family</th>
              <th>Order</th>
              <th>Class</th>
              <th>Division</th>
              <th>Image</th>
            </thead>
            <tbody>
              {data.map(this.displayPlants, this)}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default MainPage;