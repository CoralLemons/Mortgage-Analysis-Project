
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

df_db = pd.read_csv("https://www.dropbox.com/scl/fi/0yl5e0uwhh2mypl2htt7h/01_2022_HMDA_Filter.csv?rlkey=1z1qtm6h2h8rr1ubauk943la5&dl=1")

selected = df_db.loc[:, 'action_taken'].isin([4, 5])
df_selected = df_db[~selected]

print(len(df_selected))

accepted_selected = df_selected.loc[:, 'action_taken'].isin([1, 2, 6, 8])
df_selected.loc[:, 'application_approved'] = 0  # Default value is 0

# Update rows where accepted_selected is True
df_selected.loc[accepted_selected, 'application_approved'] = 1

df_selected.to_csv(r"...\Desktop\02_2022_HMDA_Filter.csv", index=False)
