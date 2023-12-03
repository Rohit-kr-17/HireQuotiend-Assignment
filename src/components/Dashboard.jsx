import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import { RiEditBoxLine } from "react-icons/ri";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { CiSaveDown2 } from "react-icons/ci";

function Dashboard() {
	//State
	const [data, setData] = useState([]);
	const [selectedData, setSelectedData] = useState([]);
	const [allSelected, setAllSelected] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [editingRows, setEditingRows] = useState([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [currentData, setCurrentData] = useState([]);
	const itemsPerPage = 10;
	const pageCount = Math.ceil(data.length / itemsPerPage);
	const offset = currentPage * itemsPerPage;

	//SideEffects
	//fetch data from API
	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axios.get(
					"https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
				);
				setData(res.data);
				setCurrentData(() => {
					return res.data.slice(offset, offset + itemsPerPage);
				});
			} catch (err) {
				console.log("Error", err);
			}
		};
		fetchData();
	}, []);

	//SelectAll checkbox
	useEffect(() => {
		if (currentData.length > 0 && selectedData.length === currentData.length)
			setAllSelected(true);
		else setAllSelected(false);
	}, [selectedData]);
	useEffect(() => {
		const updateCurrentdata = data.slice(offset, offset + itemsPerPage);
		setCurrentData(updateCurrentdata);
	}, [currentPage, data]);

	//select
	const selectAll = () => {
		const allRows = document.querySelectorAll(
			'#tableBody input[type="checkbox"]'
		);
		const allSelected = selectedData.length === currentData.length;

		if (allSelected) {
			setAllSelected(false);
			setSelectedData([]);
		} else {
			setAllSelected(true);
			setSelectedData(currentData.map((item) => item.id));
		}

		allRows.forEach((row) => {
			row.checked = !allSelected;
		});
	};
	const selectRow = (id) => {
		const index = selectedData.indexOf(id);
		if (index === -1) {
			setSelectedData([...selectedData, id]);
		} else {
			const newData = [...selectedData];
			newData.splice(index, 1);
			setSelectedData([...newData]);
		}
	};
	//pagination
	const handlePageClick = (selected) => {
		setAllSelected(false);
		setSelectedData([]);
		setCurrentPage(selected.selected);
	};
	//Delete
	const deleteSelected = () => {
		setData(() => data.filter((item) => !selectedData.includes(item.id)));
		setSelectedData([]);
	};
	const deleteRow = (id) => {
		setData(() => data.filter((item) => item.id !== id));
	};

	//edit
	const editRow = (id) => {
		const newEditingRows = [...editingRows];
		const index = newEditingRows.indexOf(id);
		if (index === -1) {
			newEditingRows.push(id);
		} else {
			newEditingRows.splice(index, 1);
		}
		setEditingRows(newEditingRows);
	};
	const handleEditChange = (e, id, fieldName) => {
		const updatedData = currentData.map((item) => {
			if (item.id === id) {
				return { ...item, [fieldName]: e.target.value };
			}
			return item;
		});
		setCurrentData(updatedData);
	};

	//Search section
	const search = (event) => {
		setSearchTerm(event.target.value.toLowerCase());
	};
	const searchData = () => {
		const filteredData = currentData.filter(
			(item) =>
				item.name.toLowerCase().includes(searchTerm) ||
				item.email.toLowerCase().includes(searchTerm) ||
				item.role.toLowerCase().includes(searchTerm)
		);
		setCurrentData(filteredData);
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		searchData();
	};

	return (
		<div className="p-5">
			<div className="flex justify-between mb-5">
				<form className="flex items-center" onSubmit={handleSubmit}>
					<input
						className="focus:outline-none h-8 p-2 rounded-l-md border-r-0  border-2"
						type="text"
						placeholder="Search"
						value={searchTerm}
						onChange={search}
					/>
					<button
						className="bg-green-200 rounded-r-md  w-8 p-2 h-8"
						onClick={searchData}
						type="button"
					>
						<CiSearch />
					</button>
				</form>
				<button
					className="w-8 h-8 p-2 bg-red-200 rounded-md"
					onClick={deleteSelected}
				>
					<AiOutlineDelete />
				</button>
			</div>
			<div className="flex-1 border-2 rounded-md">
				<table className="w-full  table-auto">
					<thead className="text-left">
						<tr>
							<th className="px-4 w-5">
								<input
									type="checkbox"
									id="selectAll"
									onClick={selectAll}
									checked={allSelected}
								/>
							</th>
							<th className="px-4 py-2">Name</th>
							<th className="px-4 py-2">Email</th>
							<th className="px-4 py-2">Role</th>
							<th className="px-4 py-2">Actions</th>
						</tr>
					</thead>
					<tbody id="tableBody">
						{currentData.map((item) => (
							<tr
								className={`${
									selectedData.includes(item.id) ? ` bg-gray-200` : ``
								} border-t-2 h-[3.5rem]`}
								key={item.id}
							>
								<td onClick={() => selectRow(item.id)} className="px-4 py-2 ">
									<input
										id={item.id}
										type="checkbox"
										checked={selectedData.includes(item.id)}
									/>
								</td>

								<td className=" px-4 py-2">
									{editingRows.includes(item.id) ? (
										<input
											className="border-2 border-black rounded-md pl-2 bg-white"
											value={item.name}
											onChange={(e) => handleEditChange(e, item.id, "name")}
										/>
									) : (
										<input
											className={`${
												selectedData.includes(item.id) ? ` bg-gray-200` : ``
											} outline-none`}
											value={item.name}
											readOnly
										/>
									)}
								</td>
								<td className=" px-4 py-2">
									{editingRows.includes(item.id) ? (
										<input
											className="border-2 border-black rounded-md pl-2 bg-white"
											value={item.email}
											onChange={(e) => handleEditChange(e, item.id, "email")}
										/>
									) : (
										<input
											className={`${
												selectedData.includes(item.id) ? ` bg-gray-200` : ``
											} outline-none`}
											value={item.email}
											readOnly
										/>
									)}
								</td>
								<td className=" px-4 py-2">
									{editingRows.includes(item.id) ? (
										<input
											className="border-2 border-black rounded-md pl-2 bg-white"
											value={item.role}
											onChange={(e) => handleEditChange(e, item.id, "role")}
										/>
									) : (
										<input
											className={`${
												selectedData.includes(item.id) ? ` bg-gray-200` : ``
											} outline-none`}
											value={item.role}
											readOnly
										/>
									)}
								</td>

								<td className=" flex px-4 py-2">
									<button
										className="border-2 w-8 h-8 flex items-center justify-center mr-2 rounded-md"
										onClick={() => editRow(item.id)}
									>
										{editingRows.includes(item.id) ? (
											<CiSaveDown2 />
										) : (
											<RiEditBoxLine />
										)}
									</button>

									<button
										className="border-2 w-8 h-8 flex items-center justify-center rounded-md"
										onClick={() => deleteRow(item.id)}
									>
										<AiOutlineDelete className="text-red-500" />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex justify-center mt-3">
				<ReactPaginate
					className="flex w-full items-center justify-between"
					previousLabel={"Previous"}
					nextLabel={"Next"}
					breakLabel={"..."}
					breakClassName={"break-me"}
					activeLinkClassName="p-1 rounded-full bg-blue-200"
					pageCount={pageCount}
					marginPagesDisplayed={2}
					pageRangeDisplayed={5}
					onPageChange={handlePageClick}
					containerClassName={"pagination"}
					subContainerClassName={"pages pagination"}
					activeClassName={"active"}
				/>
			</div>
		</div>
	);
}

export default Dashboard;
