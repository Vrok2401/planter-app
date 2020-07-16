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
      ready: false,
      type: 'q',
      name: '',
      search: false,
      results: '',
      plants: ''
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
            this.setState({ plants: result.data.reverse() });
            this.setState({ ready: true });
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

  //update fields in state
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
          if (result === '' || result.data.data === undefined) {
            alert('No plants found');
          } else {
            this.setState({ results: result.data.data });
            this.setState({ search: true });
          }
        })
        .catch(error => {
          alert('Error: ', error);
        })
    );
    
    this.displayResults();
  }
  //display search results
  displayResults() {
    if (this.state.search) {
      return(<div className="App-table">
        <table>
          <thead>
            <th>Common name</th>
            <th>Scientific name</th>
            <th>Image</th>
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
      //capitalise first letter of common name
      result_common_name = results.common_name.charAt(0).toUpperCase()+results.common_name.slice(1);
    }
    var image = '';
    if (results.image_url !== null) {
      image = <a href={results.image_url} target="_blank"><img src={results.image_url} alt={results.scientific_name}></img></a>
    }
    return(
      <tr>
        <td>{result_common_name}</td>
        <td>{results.scientific_name}</td>
        <td>{image}</td>
        <td><button onClick={this.addPlant(results.links.plant)}>Add</button></td>
      </tr>
    );
  }
  //add record
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
  //delete record
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
  //display table
  displayTable() {
    if (this.state.ready) {
      return(<div className="App-table">
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
            {this.state.plants.map(this.displayPlants, this)}
          </tbody>
        </table>
      </div>)
    }
  }
  //display plants from collection
  displayPlants(data) {
    var image = '';
    if (data.image !== '') {
      image = <a href={data.image} target="_blank"><img src={data.image} alt={data.scientific_name}></img></a>
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
        {this.displayTable()}
      </div>
    );
  }
}

export default MainPage;